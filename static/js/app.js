import store from './user_store.js'
import home from '../component/home.js'
import feeds from '../component/feed.js'
import myblogs from '../component/my_blog.js'
import register from '../component/user_form.js'
import add_blog from '../component/add_blog.js'
import userblogs from '../component/user_blog.js'
import search from '../component/search.js'
import connection from '../component/connection.js'
import edit_blog from '../component/edit_post.js'
import stats from '../component/stats.js'
const routes = [{ path: '/', component: home },
                { path: '/register', component: register , name:"register"},
                { path: '/add_blog/:username', component: add_blog , name:"add_blog"},
                { path: '/edit_blog/:username/:blog_id', component: edit_blog , name:"edit_blog"},
                { path: '/news_feed/:username', component: feeds, name: 'news_feed' },
                { path: '/user_profile/:username', component: myblogs, name: 'user_profile' },
                { path: '/author_blog/:username', component: userblogs, name: 'author_profile' },
                { path: '/search_user/:username/:search', component: search, name: 'search_user' },
                { path: '/connection/:username', component: connection, name: 'connection' },
                { path: '/blog_stats/:username', component: stats, name: 'blog_stats' },
    ]     

const router = new VueRouter({
    routes,
    base: '/',
  })
  
  const app = new Vue({
    el: '#app',
    router,
    store,
    data: {
      
    },
    methods: {
      async logout() {
        const res = await fetch('/logout')
        if (res.ok) {
          localStorage.clear()
          this.$router.push('/')
        } else {
          console.log('could not logout the user')
        }
      },
      
    },
  })