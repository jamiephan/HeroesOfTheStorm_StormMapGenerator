const express = require("express")
const Joi = require('joi');
const GithubAPI = require("../../helpers/GithubAPI");
const Error = require("../../Model/Responses/Error");

const buildSchema = async () => {

  const libsOptions = require("../../defaultSettings/")
    .libs
    .map(s => s.libraries)
    .reduce((p, n) => p.concat(n))
    .map(x => x.options)
    .reduce((p, n) => p.concat(n))
    .map(x => x.name)

  const schema = Joi.object({
    // Name must be ASCII
    name: Joi.string()
      .pattern(/^[\x20-\x7E]*\.stormmap$/i)
      .required(),

    // is Using Try Mode
    trymode20: Joi.boolean()
      .required(),

    // Map Name
    map: Joi.string()
      .when("trymode20", {
        is: true,
        then: Joi
          .valid(...await GithubAPI(GithubAPI.trymode20))
          .messages({
            "any.only": "Try Mode 2.0 Map name should be one of: " + (await GithubAPI(GithubAPI.trymode20)).join(", ")
          }),
        otherwise: Joi
          .valid(...await GithubAPI(GithubAPI.maps)).messages({
            "any.only": "Map name should be one of: " + (await GithubAPI(GithubAPI.maps)).join(", ")
          }),
      })
      .messages({
        "any.only": "yolo"
      })
      .required(),

    // AI Comp
    ai: Joi.string()
      .when("trymode20", {
        is: true,
        then: Joi.valid("none").messages({
          "any.only": "When \"trymode20\" is true, \"ai\" option must set to \"none\"."
        }),
        otherwise: Joi
          .valid(...await GithubAPI(GithubAPI.ai)).allow("none").messages({
            "any.only": "AI Composition should be one of: " + (await GithubAPI(GithubAPI.ai)).join(", ")
          }),
      })
      .required(),

    // Name must be ASCII
    msg: Joi.string()
      .pattern(/^[\x20-\x7E]*$/)
      // Allow empty string
      .allow("")
      .required(),

    xmlFiles: Joi.array()
      .items(Joi.object({
        name: Joi.string().pattern(/^[\x20-\x7E]*\.xml$/i).required(),
        content: Joi.string().required()
      }))
      .unique((a, b) => a.name.toLowerCase() === b.name.toLowerCase())
      .required(),
    libsOptions: Joi.array()
      .items(
        Joi.string().valid(
          ...libsOptions
        )
      )
      .required()

  }).prefs({ convert: false })


  return schema
}



/**
 * Validates Build Payload
 * @param {express.Request} req Request
 * @param {express.Response} res Response
 * @param {express.NextFunction} next Next
 */
const validateBuildParams = async (req, res, next) => {
  const { error } = (await buildSchema()).validate(req.body)
  if (error) return res.status(406).json(Error(error.details[0].message))
  next()
}

module.exports = validateBuildParams