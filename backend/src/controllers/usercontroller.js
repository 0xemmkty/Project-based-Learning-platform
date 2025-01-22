const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        institution: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, institution, currentPassword, newPassword } = req.body;
    const updateData = { name, institution };

    if (newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        institution: true,
        role: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { creatorId: req.user.id },
          { collaborators: { some: { id: req.user.id } } }
        ]
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

    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Error fetching user projects' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserProjects
}; 