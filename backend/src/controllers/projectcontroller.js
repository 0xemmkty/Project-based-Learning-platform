const prisma = require('../lib/prisma');
const { uploadToS3, deleteFromS3 } = require('../services/awsService');
const multer = require('multer');
const upload = multer();
require('dotenv').config();

const parseTags = (tags) => {
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags); // 如果是 JSON 格式字符串，解析为数组
    } catch {
      return tags.split(',').map(tag => tag.trim()); // 如果是逗号分隔的字符串，转为数组
    }
  } else if (Array.isArray(tags)) {
    return tags; // 已经是数组
  }
  return []; // 默认返回空数组
};

// controllers/projectController.js

// 获取单个项目的详情
const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(id);
    const project = await prisma.project.findFirst({
      where: {
        id
      },
      include: {
        media: true
      }
    });
    console.log(project);
    if (!project) {
      return res.status(404).send('Project not found');
    }
    res.json(project);  //return project detail.
  } catch (error) {
    res.status(500).send('Server error');
  }
};



const createProject = async (req, res) => {
  try {

    const { skillLevel,projectType,institution, title, description, tags } = req.body;
    const userId = req.user.id;
    //const institution = "Mit";
    //const projectType = "ENTREPRENEURSHIP";
    //const skillLevel = "INTERMEDIATE";

    console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY);
    console.log('AWS_SECRET_KEY:', process.env.AWS_SECRET_KEY ? '***' : null);
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

   
    // Validate required fields
    console.log(title+","+description+","+institution+","+projectType+","+skillLevel+","+tags);
    //institution = "Mit";
    if (!title || !description || !institution) {
      return res.status(400).json({ error: 'Title, description, and institution are required.' });
    }
    
    let mediaFiles = [];
    console.log("-----createProject--------");
    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      mediaFiles = await Promise.all(
        req.files.map(async (file) => {
          const result = await uploadToS3(file);
          return {
            type: file.mimetype.startsWith('image/') ? 'IMAGE' : 
                  file.mimetype.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
            url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.Key}`,
            key: result.Key
          };
        })
      );
    }

    // Parse and validate tags
    const parsedTags = parseTags(tags);
    console.log("---------------project creating----------------")
    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        institution,
        projectType,
        skillLevel,
        creator: { connect: { id: userId } },
        tags: {
          connectOrCreate: parsedTags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        media: {
          create: mediaFiles
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        media: true,
        collaborators: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Error creating project' });
  }
};


const getProjects = async (req, res) => {
  try {
    const { institution, projectType, skillLevel, search } = req.query;

    const where = {
      AND: [
        institution ? { institution } : {},
        projectType ? { projectType } : {},
        skillLevel ? { skillLevel } : {},
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    };

    const projects = await prisma.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        media: true,
        collaborators: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, institution, projectType, skillLevel, tags } = req.body;
    const userId = req.user.id;

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        creatorId: userId
      }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    let mediaFiles = [];
    if (req.files && req.files.length > 0) {
      mediaFiles = await Promise.all(
        req.files.map(async (file) => {
        
          const { url, key } = await uploadToS3(file, 'projects');

          return {
            type: file.mimetype.startsWith('image/') ? 'IMAGE' : 
                  file.mimetype.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
            url,
            key
          };
        })
      );
    }

    const parsedTags = parseTags(tags);

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        institution,
        projectType,
        skillLevel,
        tags: {
          set: [],
          connectOrCreate: parsedTags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        media: {
          create: mediaFiles
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        media: true,
        collaborators: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        creatorId: userId
      },
      include: {
        media: true
      }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    // 删除 S3 上的媒体文件
    await Promise.all(
      existingProject.media.map(async (media) => {
        if (media.key) {
          await deleteFromS3(media.key);
        }
      })
    );

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  getProjectById,
  deleteProject
};
