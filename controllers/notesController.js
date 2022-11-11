const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')
const { findOne, findById } = require('../models/User')

//Get all Notes - @route GET /notes
const getAllNotes = asyncHandler(async(req, res) => {
    //Get all notes in mongoDB
    const notes = await Note.find().lean()

    //If theres no existent
    if(!notes?.length){
        return res.status(400).json({ message: 'No notes found'})
    }

    //Add username to each note before sending the response 
    //Using Promise.all instead for_each 
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)
})

//Create Note - @route POST /notes
const createNewNote = asyncHandler( async(req, res) => { 
    const { user, title, text } = req.body

    if(!user || !title || !text){
        return res.status(400).json({ message: 'All fields are required'})
    }

    //Check for duplicate titles
    const duplicate = await Note.findOne({ title }).lean().exec()
    if(duplicate){
        return res.status(409).json({ message: 'Duplicate note title'})
    }

    //Create and store the new user
    const note = await Note.create({ title, user, text })
    if(note){
        return res.status(201).json({ message: 'New note created'})
    } else{
        return res.status(400).json({ message: 'Invalid note data recieved'})
    }
})

//Update Note - @route PATCH /notes
const updateNote = asyncHandler( async(req, res) => {
    const {id, user, title, text, completed } = req.body

    if(!id || !user || !title || text || typeof completed!=='boolean'){
        return res.status(400).json({ message: 'All fields are required'})
    }

    const note = await Note.findById(id).exec()
    if(!note){
        return res.status(400).json({ message: 'Note not found'})
    }
    //Checking for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()
    res.json(`'${updatedNote.title}' updated`)
})

//Delete Note - @route DELETE /notes
const deleteNote = asyncHandler(async(res, req) => {
    const {id} = req.body
    
    if(!id){
        return res.status(400).json({ message: 'Note ID required'})
    }

    const note = await findById(id).exec()
    if(!note){
        return res.status(400).json({ message: 'Note not found'})
    }

    const result = await note.deleteOne()
    const reply = `Note '${result.title}' with ID ${result._id} deleted`
    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}