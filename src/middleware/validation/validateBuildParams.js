const express = require("express")
const Joi = require('joi');
const GithubAPI = require("../../helpers/GithubAPI");
const Error = require("../../Model/Responses/Error");
const logger = require("../../helpers/Logger")("build-validation")
const libOptions = require("../../defaultSettings/").libs

const getLibsOptionsByName = name => {
  for (let i = 0; i < libOptions.length; i++) {
    const libs = libOptions[i].libraries;
    for (let j = 0; j < libs.length; j++) {
      const options = libs[j].options;
      for (let k = 0; k < options.length; k++) {
        const option = options[k];
        if (option.name === name) {
          return option
        }
      }
    }
  }
  return false
}

const buildSchema = async () => {


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
    mods: Joi.array()
      .items(Joi.string()
        .valid(...await GithubAPI(GithubAPI.mods)).messages({
          "any.only": "Mods name should be one of: " + (await GithubAPI(GithubAPI.mods)).join(", ")
        }))
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
        Joi.object({
          name: Joi.string().required(),
          value: Joi.any().required()
        }).custom((option, helper) => {
          const defaultData = getLibsOptionsByName(option.name)
          // Check if name is a valid variable name
          if (defaultData === false) return helper.message("LibOptions contains invalid variable key")
          // Check if value is not default, and correct datatype
          if (defaultData.value === option.value) return helper.message(`The value of ${defaultData.name} is same as default.`)
          if (typeof defaultData.default !== typeof option.value) return helper.message(`The type of ${defaultData.name} must be ${String(typeof defaultData.default)}.`)
          return true
        })
      )
      .required(),
    gameString: Joi.array()
      .items(Joi.string()
        .allow("")
        .pattern(/^[\x20-\x7E]{1,}=/i)
        .messages({
          "string.pattern.base": `"gameString" must be in format of "key=value"`
        })
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
  logger.info("Validating Build Params")
  const { error } = (await buildSchema()).validate(req.body)
  if (error) {
    logger.warn("Invalid Body: " + error.details[0].message)
    return res.status(406).json(Error(error.details[0].message))
  }
  logger.debug("Success Validation")

  // Normalise req.body.name
  let name = req.body.name
  name = name.replace(/\.stormmap/gi, "")
  name = name + ".stormmap"
  req.body.name = name
  next()
}

module.exports = validateBuildParams