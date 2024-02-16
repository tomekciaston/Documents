const checkEntityExists = (entityService, idPathParamName) => async (req, res, next) => {
  try {
    const entity = await entityService.exists(req.params[idPathParamName])
    if (!entity) { return res.status(404).send('Not found') }
    return next()
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).send(err)
    }
    return res.status(500).send(err.message)
  }
}

const checkEntityExistsWithMultipleParameters = (entityService) => async (req, res, next) => {
  try {
      const entityExists = await entityService.exists(req.params);
      if (!entityExists) {
          return res.status(404).send('Entity not found');
      }
      next();
  } catch (err) {
      const status = err.kind === 'ObjectId' ? 404 : 500;
      res.status(status).send(err.message);
  }
};


export { checkEntityExists, checkEntityExistsWithMultipleParameters}
