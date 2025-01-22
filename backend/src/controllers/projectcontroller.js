const prisma = require('../lib/prisma');
const { uploadToS3, deleteFromS3 } = require('../services/awsService');

const createProject = async (req, res) => {
  try {
    const { title, description, institution, projectType, skillLevel, tags } = req.body;
    const userId = req.user.id;
    let mediaFiles = [];

    // Handle file uploads if any
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

    const project = await prisma.project.create({
      data: {
        title,
        description,
        institution,
        projectType,
        skillLevel,
        creator: { connect: { id: userId } },
        tags: {
          connectOrCreate: tags.map(tag => ({
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
          connectOrCreate: tags.map(tag => ({
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

    // Delete media files from S3
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
  deleteProject
};