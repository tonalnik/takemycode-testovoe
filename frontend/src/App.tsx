import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import UsersSelector from "./Users/UsersSelector";

const App: React.FC = () => {
	return (
		<div>
			<h1>Hello React!</h1>
			<DndProvider backend={HTML5Backend}>
				<UsersSelector />
			</DndProvider>
		</div>
	);
};

export default App;
