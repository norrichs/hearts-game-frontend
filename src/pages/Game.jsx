import React, { useState, useEffect } from "react";
import CardBack from "../components/CardBack";
import CardFront from "../components/CardFront";
import HandDisplay from "../components/HandDisplay";

const Game = ({ dbUrl}, props) => {
	const [gameId, setGameId] = useState(null)
	const [globalGameState, setGlobalGameState] = useState({});
	const [hand0, setHand0] = useState([]);
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
		setHand0([...players[0].hand]);
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
		const passed = await passLoop(id);
		console.log(`  pass cycle ${passed ? 'complete' : 'incomplete'}`)
		return await getGameState(id)
	}

	const passLoop = async (id) => {
		setGamePhase('pass')
		let gameState = await aiSelectCardsToPass(id)
		//TODO move to backend
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
		while(!ready && counter < 100){
			await loopDelay(500)
			gameState = await getGameState(id)
			// TODO spread gamestate, make components to display info
			// spreadGameState(gameState)
			ready = passesReady(gameState)
			// console.log(counter)
			counter ++
		}
		console.log("out of loop")
		return true
	}

	// Gameplay Functions

	const handleSelectCard = (card) => {
		if(passCards.includes(card)){
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

	const aiSelectCardsToPass = async (id) => {
		// console.log("fetching gameState", id);
		const resp = await fetch(`${dbUrl}/gameState/passAi/${id}`)
		const data = await resp.json()
		console.log("fetched gameStateData", data);
		spreadGameState(data.data)
		return data.data
	};
	
	// UTILITY FUNCTIONS
	// TODO transition this functionality into a function in backend that checks each time a set of passes are submitted
	const passesReady = (gameState) => {
		let readyCount = 0
		gameState.players.forEach((player)=>{
			if(player.passes.length === 3) readyCount++
		})
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
	const handDisplay0 = hand0.map((card, i) => {
		return <CardFront 
			key={i} 
			cardValue={card} 
			handleSelectCard={handleSelectCard}
		/>;
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
				<button className={playReady ? 'shown' : 'hidden'}>Play Card</button>
			</aside>
			<aside className="west info-area"></aside>
			<section className="north hand-area">
				<HandDisplay>{handDisplay2}</HandDisplay>
			</section>
			<section className="east hand-area">
				<HandDisplay>{handDisplay3}</HandDisplay>
			</section>
			<section className="south hand-area">
				<HandDisplay>{handDisplay0}</HandDisplay>
			</section>
			<section className="west hand-area">
				<HandDisplay>{handDisplay1}</HandDisplay>
			</section>
			<aside className="game-sidebar">Side</aside>
		</main>
	);
};
export default Game;
