import "./App.css";
import { Switch, Route } from "react-router-dom";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import SandBox from "./pages/SandBox";

function App() {
	const dbUrl = "http://localhost:4500";
	const defaultGameId = "6102ceabe6ce0d0c6c6f2cb4";
	const userPlayer = 0;

	return (
		<>
			<Switch>
				<Route exact path="/">
					<Lobby />
				</Route>
				<Route path="/game">
					<Game
						dbUrl={dbUrl}
						gameId={defaultGameId}
						userPlayer={userPlayer}
					/>
				</Route>
				<Route path="/sandbox">
					<SandBox />
				</Route>
			</Switch>
		</>
	);
}

export default App;
