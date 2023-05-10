import { useState } from 'react';
import ReactDOM from 'react-dom';

const root = document.querySelector('#root');

function HomeIndex() {
	const [count, setCount] = useState(6);
	return <div>{count}</div>;
}

ReactDOM.createRoot(root).render(<HomeIndex />);

// console.log(React);
// console.log(React.createElement(jsx));
// console.log("ReactDOM ------->", ReactDOM);
