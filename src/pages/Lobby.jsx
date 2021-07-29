import React, {useState, useEffect}from 'react'
import {Link} from 'react-router-dom'

const Lobby = () => {
	return(
		<main>
			<h1>Hearts</h1>
			<h2>Lobby</h2>
			<Link to="/game">
				<button>Play Game</button>
			</Link>
		</main>


	)
}
export default Lobby