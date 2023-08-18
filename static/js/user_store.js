const store=new Vuex.Store({
    state: {
        current_user: {}
    },
    getters:{
        get_username(state) 
        { return state.current_user.username},
    },
    mutations: {
        set_current_user(state, user){
            state.current_user = Object.assign({},user)
        }
    },
    actions:{
        get_current_user: async function(context,username){
            fetch("/api/current_user/"+username).then(r=>r.json()).then(d=>context.commit("set_current_user",d))
        }
    }
})

export default store