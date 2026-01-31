const roles = [
  { name: "ADMIN", createdAt: new Date(), updatedAt: new Date() },
  { name: "SUPPORT", createdAt: new Date(), updatedAt: new Date() },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Roles", roles);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
