const permissions = [
  { name: "USER_READ", createdAt: new Date(), updatedAt: new Date() },
  { name: "USER_CREATE", createdAt: new Date(), updatedAt: new Date() },
  { name: "USER_UPDATE", createdAt: new Date(), updatedAt: new Date() },
  { name: "USER_DELETE", createdAt: new Date(), updatedAt: new Date() },
  { name: "AUDIT_READ", createdAt: new Date(), updatedAt: new Date() },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Permissions", permissions);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Permissions", null, {});
  },
};
