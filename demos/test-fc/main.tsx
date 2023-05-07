import React from 'react';
import ReactDOM from 'react-dom';

const root = document.querySelector('#root');

function HomeIndex() {
	return (
		<div>
			<span>cosen writing react</span>
		</div>
	);
}

ReactDOM.createRoot(root).render(<HomeIndex />);

// console.log(React);
// console.log(React.createElement(jsx));
// console.log("ReactDOM ------->", ReactDOM);
