import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';
import { Meteor } from 'meteor/meteor';
// App component - represents the whole app

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hideCompleted: false,
    };
  }
	
   handleSubmit(event) {
    event.preventDefault(); 

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Tasks.insert({    // adding a task to the tasks collection
      text,
      createdAt: new Date(), // current time
      owner: Meteor.userId(),           // _id of logged in user
      username: Meteor.user().username,  // username of logged in user
    });

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }


  toggleHideCompleted() {
    this.setState({   // update the state property asynchronously and then cause the component to re-render
      hideCompleted: !this.state.hideCompleted,
    });
  }





  renderTasks() {
	let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);    // update our renderTasks function to filter out completed tasks when this.state.hideCompleted is true
    }
	  
	  
    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render() {
    return (
    
      <div className="container">
      
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>          
            <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>
          
          <AccountsUIWrapper />
          
          { this.props.currentUser ?     
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
              <input
                type="text"
                ref="textInput"
                placeholder="Type to add new tasks"
              />
            </form> : ''
		 }
        </header>



        <ul>

          {this.renderTasks()}

        </ul>

      </div>

    );

  }

}
App.propTypes = {

  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired, //  Display incompleteCount in the header
  currentUser: PropTypes.object,
};

 
//The wrapped App component fetches tasks from the Tasks collection and supplies them to the underlying App component it wraps as the tasks prop
export default createContainer(() => {

  return {          
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),   //Showing a count of incomplete tasks
	currentUser: Meteor.user()}; //to get information about the currently logged in user
}, App);
