module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM Roles`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM Permissions`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));
    const permMap = Object.fromEntries(permissions.map(p => [p.name, p.id]));

    const mappings = [
      // ADMIN
      { roleId: roleMap.ADMIN, permissionId: permMap.USER_READ },
      { roleId: roleMap.ADMIN, permissionId: permMap.USER_CREATE },
      { roleId: roleMap.ADMIN, permissionId: permMap.USER_UPDATE },
      { roleId: roleMap.ADMIN, permissionId: permMap.USER_DELETE },
      { roleId: roleMap.ADMIN, permissionId: permMap.AUDIT_READ },

      // SUPPORT
      { roleId: roleMap.SUPPORT, permissionId: permMap.USER_READ },
    ].map(m => ({
      ...m,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("RolePermissions", mappings);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("RolePermissions", null, {});
  },
};

