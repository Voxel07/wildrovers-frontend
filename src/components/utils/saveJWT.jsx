export const saveJWT = async(token) =>{
    localStorage.setItem("jwt",token);
}