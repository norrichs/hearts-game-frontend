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
		console.log("fetching gameState", id);
		const resp = await fetch(`${dbUrl}/gameState/getState/${id}`)
		const data = await resp.json()
		console.log("fetched gameStateData", data);
		spreadGameState(data.data)
		return data.data
	};

	// GAME LOOPS //
	const gameLoop = async () => {
		console.log('enter gameLoop')
		const newGameData = await startNewGame()
		console.log('new game data', newGameData._id, newGameData)
		const passed = await passLoop(newGameData._id);
		console.log(`  pass cycle ${passed ? 'complete' : 'incomplete'}`)
	}
	
	const passLoop = async (id) => {
		setGamePhase('pass')
		let gameState = await aiSelectCardsToPass(id)
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
		console.log('start loop next')
		while(!ready && counter < 100){
			await loopDelay(500)
			gameState = await getGameState(id)
			ready = passesReady(gameState)
			console.log(counter)
			counter ++
		}
		console.log("out of loop")
		return true
		
		
	}

	
	// Gameplay Functions
	const passSelectedCards = () => {
	}
	const handleSelectCard = (card) => {
		setPassCards([card, ...passCards])
	}


	
	const aiSelectCardsToPass = async (id) => {
		console.log("fetching gameState", id);
		const resp = await fetch(`${dbUrl}/gameState/passAi/${id}`)
		const data = await resp.json()
		console.log("fetched gameStateData", data);
		spreadGameState(data.data)
		return data.data
	};
	
	

	
	// UTILITY FUNCTIONS
	
	const passesReady = (gameState) => {
		let readyCount = 0
		gameState.players.forEach((player)=>{
			if(player.passes.length === 3) readyCount++
		})
		return readyCount === 3
	}
	
	const loopDelay = (ms) => {
		return new Promise(resolve=>{
			setTimeout(()=>{ resolve('')}, ms)
		})
	}


	const handLoop =  () => {
		console.log("play the hand")
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
	
	
	
	
	// 			console.log("newGameData", data);
	// 			const id = data.data._id;
	// 			console.log('new game id', id)
	// 			// spreadGameState(data.data)
	// 			return id
	// 		})
	// 		.then((id) => {
		// 			fetch(`${dbUrl}/gameState/deal/${id}`)
	// 				.then(res => res.json())
	// 				.then(data => {
		// 					console.log("new deal data", data)
	// 					spreadGameState(data.data)
	// 					return data.data
	// 				})
	
	// 		}).then(data=>{
	// 			console.log('new data to return from startNewGame', data)
	// 			return data
	// 		})
	// 		return data
	// }
	
	
	
	// const startNewGame = async () => {
		// 	console.log("starting new Game")
	// 	const data = fetch(`${dbUrl}/gameState/seed`)
	// 		.then((res) => res.json())
	// 		.then((data)=> {
	// 			console.log("newGameData", data);
	// 			const id = data.data._id;
	// 			console.log('new game id', id)
	// 			// spreadGameState(data.data)
	// 			return id
	// 		})
	// 		.then((id) => {
		// 			fetch(`${dbUrl}/gameState/deal/${id}`)
	// 				.then(res => res.json())
	// 				.then(data => {
	// 					console.log("new deal data", data)
	// 					spreadGameState(data.data)
	// 					return data.data
	// 				})
	
	// 		}).then(data=>{
		// 			console.log('new data to return from startNewGame', data)
	// 			return data
	// 		})
	// 		return data
	// }

	//////////////////////////////////////////////////////////
	//	Put Game State
	//		collects local game state and PUTs to db gameState
	//		- called after each turn or any other alteration
	//		  of game state to be communicated to other players	
	//////////////////////////////////////////////////////////
	const putGameState = () => {
		console.log("posting gameState");
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
		// const gameStartStatus =  startNewGame()
		// console.log('start status', gameStartStatus)
		// while(!gameStartStatus){
			// 	setTimeout(()=>console.log('pause',gameStartStatus), 1000)
			// }
		gameLoop()
	}, []);
	
	return (
		<main className="game-main">
			<section className="play-area"></section>
			<aside className="north info-area"></aside>
			<aside className="east info-area"></aside>
			<aside className="south info-area">
				<button>Pass</button>
				<button>Play Card</button>
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
