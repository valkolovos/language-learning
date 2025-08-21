module.exports = {
  default: {
    require: ['features/steps/*.ts'],
    format: ['progress'],
    publishQuiet: true,
    requireModule: ['ts-node/register']
  }
};
