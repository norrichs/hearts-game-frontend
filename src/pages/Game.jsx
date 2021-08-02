import React, { useState, useEffect } from "react";
import CardBack from "../components/CardBack";
import CardFront from "../components/CardFront";
import HandDisplay from "../components/HandDisplay";

const Game = ({ dbUrl, userPlayer}, props) => {
	// console.log('userPlayer number', userPlayer)
	const [gameId, setGameId] = useState(null)
	const [globalGameState, setGlobalGameState] = useState({});
	const [userHand, setUserHand] = useState([]);
	const [userSelections, setUserSelections] = useState([])
	// TODO eliminate frontend HAND data for all but 0
	const [hand1, setHand1] = useState([]);
	const [hand2, setHand2] = useState([]);
	const [hand3, setHand3] = useState([]);

	const [passCardsCount, setPassCardsCount] = useState(0);
	const [passCards, setPassCards] = useState([])
	const [passReady, setPassReady] = useState(false)

	const [playReady, setPlayReady] = useState(false)

	const [playerState0, setPlayerState0] = useState([]);
	const [playerState1, setPlayerState1] = useState([]);
	const [playerState2, setPlayerState2] = useState([]);
	const [playerState3, setPlayerState3] = useState([]);

	const [gamePhase, setGamePhase] = useState('deal')

	// Event Handler Functions


	//////////////////////////////////////////////////////////
	//	Spread Game State
	// 		Unpacks game state data into local state varibles
	//////////////////////////////////////////////////////////
	const spreadGameState = (gameStateData) => {
		console.log('spreading to useState', gameStateData)
		const { players, ...rest } = gameStateData;
		setGlobalGameState(rest);
		setUserHand([...players[userPlayer].hand]);
		setHand1([...players[1].hand]);
		setHand2([...players[2].hand]);
		setHand3([...players[3].hand]);
		setPlayerState0({ ...players[0] });
		setPlayerState1({ ...players[1] });
		setPlayerState2({ ...players[2] });
		setPlayerState3({ ...players[3] });
	}
	
	const getGameState = async (id) => {
		// console.log("fetching gameState", id);
		const resp = await fetch(`${dbUrl}/gameState/getState/${id}`)
		const data = await resp.json()
		// console.log("fetched gameStateData", data);
		return data.data
	};

	// GAME LOOPS //
	const gameLoop = async () => {
		console.log('enter gameLoop')
		let currentGameState = await startNewGame()
		setGameId(currentGameState._id)
		console.log('new game data', currentGameState._id, currentGameState)
		let maxScore = 0;
		let winScore = currentGameState.winScore
		while(maxScore < winScore){
			console.log('start new hand, current maxScore:', maxScore)
			currentGameState = await handLoop(currentGameState._id)
			maxScore = currentGameState.maxScore
		}
	}

	const handLoop = async (id) =>{
		// alert('start hand loop', gamePhase)
		// One pass loop per hand
		// local state, set phase to 'pass'.  Pass phase set in backend by 'deal' function
		setGamePhase('pass')
		// Init selections array
		const blankSelections = new Array(13)
		blankSelections.fill(false)
		console.log('blank',blankSelections)
		setUserSelections([...blankSelections])

		let gameState = await passLoop(id);
		setUserSelections([...gameState.players[userPlayer].hand].fill(false))
		spreadGameState(gameState)
		// Set all cards in hand to unselected, and set new passed to selected
		
		
		// Enter Trick taking phase
		setGamePhase('tricks')
		let trickCount = 1;
		while ( trickCount <= 13 ){
			await loopDelay(3000)
			console.log(`    trick ${trickCount} begin`)
			trickCount = await trickLoop(id, trickCount)
		}
		return await getGameState(id)
	}
	//////////////////////////////
	// passLoop
	//		handles waiting for passable cards to be selected
	//		loops infinitely waiting for all palyers to make selections
	//		(including user)
	//		passing of cards is handled by the backend.  Each submission of selected
	// 		cards by human or computer triggers a check for all-selected, and subsequent pass
	///////////////////////////////
	const passLoop = async (id) => {

		
		// Update local state
		let gameState = await getGameState(id)
		spreadGameState(gameState)

		// calculate pass alignment for display
		// same calculation happens in backend when pass is executed
		const passIndex = gameState.turn % 4;
		if(passIndex === 3) return
		else if(passIndex === 0){
			// alert('pass left')
		}else if(passIndex === 1){
			alert('pass right')
		}else{
			alert('pass across')
		}

		let ready = passesReady(gameState)
		let counter = 0;
		
		// TODO remove counter-limit for production
		while(!ready && counter < 100){
			await loopDelay(500)
			// poll DB game state, looking for all players ready
			console.log('passloop update localstate')
			gameState = await getGameState(id)
			ready = passesReady(gameState) || gameState.phase !== 'pass'
			// console.log(counter)
			counter ++
		}
		// alert("pass loop complete")
		
		return gameState
	}

	/////////////////////////////////////	
	// Trick Loop function
	// 		after cards have been passed
	//			if user's turn
	//				loop with long delay (or escape loop cycles)
	//				when user selects a card and clicks Play button, escape from loop
	//			else
	//				poll server gameState with delay
	//				show current player turn status

	const trickLoop = async (id, trickCount) => {
		console.log('start trick loop for trick', trickCount, 'game',id)
		let waiting = true
		let inProgress = true
		
		while(inProgress){
			let gameState = await getGameState(id)
			console.log('    trick loop',gameState.players[userPlayer].hand)
			if(gameState.activePlayer === userPlayer){
				// alert('your turn')
				console.log("user's turn (pre)")
				await loopDelay(3000)
				console.log("user's turn (post)")
			}else{
				while(waiting){
					// console.log("other's turn")
					await loopDelay(3000)
					gameState = await getGameState(id)
					console.log('    trickLoop other player', gameState.players[1].hand)
					spreadGameState(gameState)
				}
			}
		}		
		return trickCount += 1;


	}

	// Gameplay Functions

	const handleSelectCard = (card) => {
		const selArr = [...userSelections]
		const i = userHand.indexOf(card)

		if(gamePhase === 'pass'){
			selArr[i] = selArr[i] ? false : true
			setUserSelections([...selArr])
			// max selected = 3, extras replace
			if(passCards.includes(card)){
				// alert('gamephase = pass ' + card + ' passready', passReady)


				if(passReady) setPassReady(false)
				passCards.splice(passCards.indexOf(card), 1)
				setPassCards([...passCards])
			}else{
				if(passCards.length === 3){
					setPassCards([passCards[1], passCards[2], card ])
				}else{
					if(passCards.length === 2) setPassReady(true)
					setPassCards([...passCards, card])
				} 
			}
		}else if(gamePhase === 'tricks'){
			// max selected = 1, extras replace
			if(passCards.length === 0){
				console.log('first selection')
				selArr[i] = true
				setPlayReady(true)
				setPassCards([card])
				setUserSelections([...selArr])
			}else{
				if(passCards[0] === card){
					console.log('selected second.  remove first')
					selArr[i] = false
					setUserSelections([...selArr])
					setPassCards([])
				}else{
					console.log('deselecting')
					const j = userHand.indexOf(passCards[0])
					selArr[i] = true
					selArr[j] = false
					setUserSelections([...selArr])
					setPassCards([card])
				}
			}
		}

	}



	const handlePass = async () => {
		let gameState = await getGameState(gameId)
		console.log('passcards, gamestate', passCards, gameState)
		passCards.forEach((card)=>{
			const i = gameState.players[0].hand.indexOf(card)
			gameState.players[0].hand.splice(i,1)
		})
		gameState.players[0].passes = [...passCards]
		console.log('put game state', gameId)
		gameState = await putGameStatePassCards(gameState, gameId)
		console.log('post-pass game state', gameState)
		spreadGameState(gameState)
		setPassCards([])

	}

	const handlePlay = async () => {
		alert('play '+ passCards[0])
	}

	
	// UTILITY FUNCTIONS
	// TODO transition this functionality into a function in backend that checks each time a set of passes are submitted
	const passesReady = (gameState) => {
		let readyCount = 0
		gameState.players.forEach((player)=>{
			if(player.passes.length === 3) readyCount++
		})
		// Return true if all players have selected cards to pass
		return readyCount === 4
	}
	
	const loopDelay = (ms) => {
		return new Promise(resolve=>{
			setTimeout(()=>{ resolve('')}, ms)
		})
	}

	///////////////////////////////////////////////////////
	//	Start New Game - 
	//		Calls Seed function
	//		Calls Deal function
	//		Spreads new game state to local state variables
	///////////////////////////////////////////////////////
	const startNewGame = async () => {
		console.log("  starting new Game")
		let resp = await fetch(`${dbUrl}/gameState/seed`)
		let data = await resp.json()
		const id   = data.data._id
		resp = await fetch(`${dbUrl}/gameState/deal/${id}`)
		data = await resp.json()
		const newGameData = data.data
		spreadGameState(newGameData)
		console.log('  newly dealt game data', newGameData)
		return newGameData
		
	}
	
	//////////////////////////////////////////////////////////
	//	Put Game State
	//		collects local game state and PUTs to db gameState
	//		- called after each turn or any other alteration
	//		  of game state to be communicated to other players	
	//////////////////////////////////////////////////////////
	const putGameState = async (gameState, id) => {
		console.log("putting gameState");
		const resp = await fetch(`${dbUrl}/gameState/putState/${id}`,{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(gameState)
		})
		console.log('PUT gameState response', resp)
	};

	const putGameStatePassCards = async (gameState, id) => {
		console.log("putting gameState");
		const resp = await fetch(`${dbUrl}/gameState/passCards/${id}`,{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(gameState)
		})
		const data = await resp.json()
		console.log('passCard new gameState', data.data)
		return data.data
	};


	
	// JSX Arrays
	const userHandDisplay = userHand.map((card, i) => {
		return (
			<div key={i} className={`card-container ${userSelections[i] ? 'selected' : 'unselected'}`}>
				<CardFront 
					
					cardValue={card} 
					handleSelectCard={handleSelectCard}
				/>
			</div>
		) 
	});
	const handDisplay1 = hand1.map((card, i) => {
		return <CardBack key={i} />;
	});
	const handDisplay2 = hand2.map((card, i) => {
		return <CardBack key={i} />;
	});
	const handDisplay3 = hand3.map((card, i) => {
		return <CardBack key={i} />;
	});

	useEffect( () => {
		gameLoop()
	}, []);
	
	return (
		<main className="game-main">
			<section className="play-area"></section>
			<aside className="north info-area"></aside>
			<aside className="east info-area"></aside>
			<aside className="south info-area">
				<button className={passReady ? 'shown' : 'hidden'} onClick={handlePass}>Pass</button>
				<button className={playReady ? 'shown' : 'hidden'} onClick={handlePlay}>Play Card</button>
			</aside>
			<aside className="west info-area"></aside>
			<section className="north hand-area">
				<HandDisplay>{handDisplay2}</HandDisplay>
			</section>
			<section className="east hand-area">
				<HandDisplay>{handDisplay3}</HandDisplay>
			</section>
			<section className="south hand-area">
				<HandDisplay>{userHandDisplay}</HandDisplay>
			</section>
			<section className="west hand-area">
				<HandDisplay>{handDisplay1}</HandDisplay>
			</section>
			<aside className="game-sidebar">Side</aside>
		</main>
	);
};
export default Game;
