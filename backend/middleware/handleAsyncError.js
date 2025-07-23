export default (myErrorfn) => (req, res, next) => {
  Promise.resolve(myErrorfn(req, res, next)).catch(next);
};
