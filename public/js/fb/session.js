export const startSession = (user) => {
    sessionStorage.setItem("email", user.email);
    sessionStorage.setItem("uid", user.uid);
    sessionStorage.setItem("accessToken", user.accessToken);
  }
  
export const getSession = () => {
    return {
      email: sessionStorage.getItem("email"),
      uid: sessionStorage.getItem("uid"),
      accessToken: sessionStorage.getItem("accessToken"),
    }
}
  
export const endSession = () => {
    sessionStorage.clear();
}
  
export const isLoggedIn = () => {
    return getSession().accessToken;
}