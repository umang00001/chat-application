const isLogin = async (req, resp, next) => {
    try {
        if (req.session.user) {

        } else {
            resp.redirect("/login")
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async (req, resp, next) => {
    try {
        if (req.session.user) {
            resp.redirect("/dashboard");
        }
        next()

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isLogin,
    isLogout
}