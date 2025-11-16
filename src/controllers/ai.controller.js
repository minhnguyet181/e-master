// src/controllers/ai.controller.js
const AIService = require('../services/ai.service');
const { handleResponse, handleError } = require('./base.controller');

exports.gradeWriting = async (req, res) => {
  try {
    const result = await AIService.gradeWriting(req.body.essay);
    handleResponse(res, JSON.parse(result), 'Writing graded successfully');
  } catch (err) {
    handleError(res, err);
  }
};

exports.gradeSpeaking = async (req, res) => {
  try {
    const result = await AIService.gradeSpeaking(req.body.transcript);
    handleResponse(res, JSON.parse(result), 'Speaking graded successfully');
  } catch (err) {
    handleError(res, err);
  }
};
