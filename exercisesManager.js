class ExercisesManager {
    test = false;
    usersArray = []; 
  
    constructor() {}
  
    createNewUsername(userN) {
      if (this.test) {
        console.log("userN: " + userN);
      }
      const user = this.usersArray.find(entry => entry.username === userN);
      if (user) {
        return user._id;
      } else {
        const id = this.usersArray.length + 1;
        this.usersArray.push({ username: userN, count: 0, _id: id.toString(), log: [] });
        return id.toString();
      }
    }
  
    getUserByIdAndApplyEx(idUser, descripApplied, durationAppl, dateAppl) {
      if (this.test) {
        console.log("idUser: " + idUser);
      }
  
      let userApply = this.usersArray.find(entry => entry._id === idUser);
      if (this.test) {
        console.log("userApply: " + JSON.stringify(userApply, null, 2));
      }
      if (!userApply) {
        return null;
      } else {
        let counter = userApply.count + 1;
        userApply.count = counter;
  
        userApply.log.push({
          description: descripApplied,
          duration: durationAppl,
          date: dateAppl.toDateString()
        });
  
        return userApply;
      }
    }
  
    getUserLog(idUser) {
      return this.usersArray.find(entry => entry._id === idUser);
    }
  
    getAllUsers() {
      return this.usersArray.map(user => ({
        username: user.username,
        _id: user._id
      }));
    }
  }
  
  module.exports = ExercisesManager;
  