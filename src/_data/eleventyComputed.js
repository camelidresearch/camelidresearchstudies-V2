module.exports = {
    T: (data) => (data.ui && data.ui[data.lang || "it"]) || {}
};