const auth_middleware = require("../middleware/auth_middileware");

const dashboard_page_show = (req, res, next) => {
    res.render("admin/dashboard", { layout: "layout/admin_layout.ejs" });
};

const input_page_show = (req, res, next) => {
    res.render("admin/input", { layout: "layout/admin_layout.ejs" });
};

module.exports={
    dashboard_page_show,input_page_show
}