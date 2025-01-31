const prisma = require('../lib/prisma');
const { uploadToS3, deleteFromS3 } = require('../services/awsService');
const multer = require('multer');
//const upload = multer();
const upload = multer().fields([{ name: 'files', maxCount: 5 }]);  // 配置文件上传字段名

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
  try {
    const { id } = req.params;
    console.log('Fetching project with id:', id);  // 调试日志

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        creator: true,
        tags: true,
        media: true,
        collaborators: true
      }
    });

    console.log('Found project:', project);  // 调试日志

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error in getProjectById:', error);  // 错误日志
    res.status(500).json({ message: 'Error fetching project details' });
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
    const projectId = parseInt(req.params.id);  // 转换为整数
    const { title, description, institution, projectType, skillLevel, tags } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 先检查项目是否存在
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        creator: true
      }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 检查用户是否是项目创建者
    if (existingProject.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    let mediaFiles = [];
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

    const parsedTags = parseTags(tags);

    // 更新项目
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        title,
        description,
        institution,
        projectType,
        skillLevel,
        tags: {
          set: [],  // 先清除所有标签
          connectOrCreate: parsedTags.map(tag => ({
            where: { name: tag },
            create: { name: tag }
          }))
        },
        ...(mediaFiles.length > 0 && {
          media: {
            create: mediaFiles
          }
        })
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
    res.status(500).json({ error: 'Error updating project', details: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.id;

    console.log('Attempting to delete project:', projectId); // 调试日志

    // 先检查项目是否存在
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        media: true,
        tags: true
      }
    });

    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    // 检查用户权限
    if (project.creatorId !== userId) {
      console.log('User not authorized:', userId);
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }

    // 使用事务确保所有删除操作都成功
    await prisma.$transaction(async (tx) => {
      // 1. 删除媒体记录
      if (project.media.length > 0) {
        console.log('Deleting media records...');
        await tx.media.deleteMany({
          where: { projectId }
        });
      }

      // 2. 删除标签关联
      if (project.tags.length > 0) {
        console.log('Removing tag associations...');
        await tx.project.update({
          where: { id: projectId },
          data: {
            tags: {
              set: []
            }
          }
        });
      }

      // 3. 删除项目
      console.log('Deleting project...');
      await tx.project.delete({
        where: { id: projectId }
      });
    });

    console.log('Project deleted successfully:', projectId);
    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ 
      error: 'Failed to delete project',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


const deleteMedia = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const userId = req.user.id;

    const existingMedia = await prisma.media.findFirst({
      where: {
        id,
        creatorId: userId
      },
      }
    );

    if (!existingMedia) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Error deleting media' });
  }
}

// 删除项目媒体
const deleteProjectMedia = async (req, res) => {
  try {
    const { id: projectId, mediaId } = req.params;
    const userId = req.user.id;

    // 检查项目是否存在且用户是否有权限
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      include: { creator: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.creatorId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // 检查媒体是否存在
    const media = await prisma.media.findUnique({
      where: { id: Number(mediaId) }
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // 删除媒体记录
    await prisma.media.delete({
      where: { id: Number(mediaId) }
    });

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting project media:', error);
    res.status(500).json({ message: 'Failed to delete media' });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  getProjectById,
  deleteProject,
  deleteProjectMedia
};