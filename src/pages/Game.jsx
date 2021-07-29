import React, { useState, useEffect } from "react";
import CardBack from "../components/CardBack";
import CardFront from "../components/CardFront";
import HandDisplay from "../components/HandDisplay";

const Game = ({ dbUrl}, props) => {
	const [gameId, setGameId] = useState(null)
	const [globalGameState, setGlobalGameState] = useState({});
	const [hand0, setHand0] = useState([]);
	const [hand1, setHand1] = useState([]);
	const [hand2, setHand2] = useState([]);
	const [hand3, setHand3] = useState([]);

	const [playerState0, setPlayerState0] = useState([]);
	const [playerState1, setPlayerState1] = useState([]);
	const [playerState2, setPlayerState2] = useState([]);
	const [playerState3, setPlayerState3] = useState([]);

	// Event Handler Functions
	const handleDoubleClickCard = () => {
		alert('chose cards')
		// 	if it is primary player's turn
		//		choose card and post gamestate
		//		update card played State and trigger animation?
		//	else if	it is card passing time && three cards are selected
		//		choose cards and post gamestate
		//		trigger animation
	}

	const handDisplay0 = hand0.map((card, i) => {
		return <CardFront key={i} cardValue={card} handleDoubleClickCard={handleDoubleClickCard}/>;
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

	const getGameState = async () => {
		console.log("fetching gameState");
		fetch(`${dbUrl}/gameState/getState/${gameId}`)
			.then((res) => res.json())
			.then((data) => {
				console.log("gameStateData", data);
				spreadGameState(data.data)
			});
	};
	const startNewGame = async () => {
		console.log("starting new Game")
		fetch(`${dbUrl}/gameState/seed`)
			.then((res) => res.json())
			.then((data)=> {
				console.log("newGameData", data);
				const id = data.data._id;
				console.log('new game id', id)
				// spreadGameState(data.data)
				return id
			})
			.then((id) => {
				fetch(`${dbUrl}/gameState/deal/${id}`)
					.then(res => res.json())
					.then(data => {
						console.log("new deal data", data)
						spreadGameState(data.data)
					})
			})
	}
	const postGameState = () => {
		console.log("posting gameState");
	};

	useEffect(() => {
		startNewGame()
		// deal hand
		// getGameState()
	}, []);

	return (
		<main className="game-main">
			<section className="play-area"></section>
			<aside className="north info-area"></aside>
			<aside className="east info-area"></aside>
			<aside className="south info-area"></aside>
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
