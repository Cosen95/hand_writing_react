import { FiberNode } from './fiber';
import {
	HostComponent,
	HostText,
	HostRoot,
	FunctionComponent
} from './workTags';
import {
	createInstance,
	appendInitialChild,
	createTextInstance,
	Container
} from 'hostConfig';
import { NoFlags, Update } from './fiberFlags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';

function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update;
}

// 需要解决的问题：
// 对于Host类型fiberNode：构建离屏DOM树
// 标记Update flag（TODO）
export const completeWork = (workInProgress: FiberNode) => {
	// 递归中的归
	const newProps = workInProgress.pendingProps;
	const current = workInProgress.alternate;

	switch (workInProgress.tag) {
		case HostComponent:
			if (current !== null && workInProgress.stateNode) {
				// update
				updateFiberProps(workInProgress.stateNode, newProps);
			} else {
				// 1、构建DOM
				// const instance = createInstance(workInProgress.type, newProps);
				const instance = createInstance(workInProgress.type, newProps);
				// 2、将DOM插入到DOM树中
				appendAllChildren(instance, workInProgress);
				workInProgress.stateNode = instance;
			}
			bubbleProperties(workInProgress);
			return null;
		case HostText:
			if (current !== null && workInProgress.stateNode) {
				// update
				const oldText = current.memoizedProps.content;
				const newText = newProps.content;
				if (oldText !== newText) {
					// 标记更新
					markUpdate(workInProgress);
				}
			} else {
				// 1、构建DOM
				const instance = createTextInstance(newProps.content);
				// 2、将DOM插入到DOM树中
				workInProgress.stateNode = instance;
			}
			bubbleProperties(workInProgress);

			return null;
		case HostRoot:
			bubbleProperties(workInProgress);

			return null;
		case FunctionComponent:
			bubbleProperties(workInProgress);

			return null;

		default:
			break;
	}
};

function appendAllChildren(parent: Container, workInProgress: FiberNode) {
	let node = workInProgress.child;

	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		if (node === workInProgress) {
			return;
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === workInProgress) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// flags分布在不同fiberNode中，如何快速找到他们？
// 答案：利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode
function bubbleProperties(workInProgress: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = workInProgress.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = workInProgress;
		child = child.sibling;
	}

	workInProgress.subtreeFlags |= subtreeFlags;
}
