import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './recipeView.js'
import searchView from './searchView.js';
import resultsView from './resultsView.js';
import bookmarksView from './bookmarksView.js';
import paginationView from './paginationView.js';
import addRecipeView from './addRecipeView.js';
import 'core-js/stable';
import "regenerator-runtime/runtime.js";
/* if(module.hot){
  module.hot.accept()
} */
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1) //  id sin el hash (osea sólo el id)
    if (!id) return
    recipeView.renderSpinner()

    //0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage())

    // update bookmark view
    bookmarksView.update(model.state.bookmarks)
    
    // 1 Loading recipe
    await model.loadRecipe(id)

    // 2 Rendering recipe
    recipeView.render(model.state.recipe)

    
  } catch (err) {
    recipeView.renderError()

  }
}

const controlSearchResults = async function(){
  try {
    resultsView.renderSpinner()

    // 1 - get search query
    const query = searchView.getQuery()
    if(!query) return

    // 2 load search results
    await model.loadSearchResults(query)

    //3 render results
    resultsView.render(model.getSearchResultsPage(3))

    // render initial pagination buttons 
    paginationView.render(model.state.search)
  }catch(err){
    console.log(err)
  }
}

const controlPagination = function(goToPage){
    //1 render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage))

    //2 render  NEW  Initial pagination buttons 
    paginationView.render(model.state.search)
}

const controlServings = function(newServings = 4){
  //update the recipe servings (in state)
  model.updateServings(newServings)

  
  // update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function(){
  // 1- add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)

  // 2 - update recipe view
  recipeView.update(model.state.recipe)

  // 3 - render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
    bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  try {
  // Show loading spinner
  addRecipeView.renderSpinner()

  //upload the new recipe data
  await model.uploadRecipe(newRecipe)

  //render recipe
  recipeView.render(model.state.recipe)

  //Success message
  addRecipeView.renderMessage()

  // Render bookmark view
  bookmarksView.render(model.state.bookmarks)

  // Change ID in URL 
  window.history.pushState(null, '', `#${model.state.recipe.id}`)
  

  // close form window
  setTimeout(function(){
    addRecipeView.toggleWindow()
  }, MODAL_CLOSE_SEC * 1000)
  } catch(err){
    console.error('error :c', err)
    addRecipeView.renderError(err.message)
  }
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}
init()