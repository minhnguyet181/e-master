// src/services/test.service.js
const Test = require('../models/test.model');

class TestService {

  static async getAllTests() {
    return await Test.findAll();
  }

  static async getTestsByType(type) {
    return await Test.findAll({ where: { test_type: type } });
  }

  static async getTest(id) {
    const test = await Test.findByPk(id);
    if (!test) throw new Error("Test not found");
    return test;
  }
}

module.exports = TestService;
