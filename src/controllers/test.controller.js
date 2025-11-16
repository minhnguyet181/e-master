// src/controllers/test.controller.js
const TestService = require('../services/test.service');
const { handleResponse, handleError } = require('./base.controller');

exports.getAll = async (req, res) => {
  try {
    const tests = await TestService.getAllTests();
    handleResponse(res, tests);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getByType = async (req, res) => {
  try {
    const tests = await TestService.getTestsByType(req.params.type);
    handleResponse(res, tests);
  } catch (err) {
    handleError(res, err);
  }
};

exports.getById = async (req, res) => {
  try {
    const test = await TestService.getTest(req.params.id);
    handleResponse(res, test);
  } catch (err) {
    handleError(res, err);
  }
};
