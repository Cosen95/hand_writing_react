import { FiberNode } from './fiber';
import {
	HostRoot,
	HostComponent,
	HostText,
	FunctionComponent
} from './workTags';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { ReactElementType } from '../../shared/ReactTypes';
import { reconcilerChildFibers, mountChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';

// 对于如下结构的reactElement：

// <A>
//  <B/>
// </A>
// 当进入A的beginWork时，通过对比B current fiberNode与B reactElement，生成B对应workInProgress fiberNode

// 递归中的递阶段
export const beginWork = (workInProgress: FiberNode) => {
	// 比较 返回子fiberNode
	switch (workInProgress.tag) {
		case HostRoot:
			return updateHostRoot(workInProgress);
		case HostComponent:
			return updateHostComponent(workInProgress);
		case HostText:
			// HostText没有beginWork工作流程 因为它没有根节点
			return null;
		case FunctionComponent:
			return updateFunctionComponent(workInProgress);

		default:
			if (__DEV__) {
				console.warn('beginWork尚未实现的类型');
			}
			break;
	}
	return null;
};

function updateFunctionComponent(workInProgress: FiberNode) {
	const nextChildren = renderWithHooks(workInProgress);

	reconcilerChildren(workInProgress, nextChildren);
	return workInProgress.child;
}

// 1、计算状态的最新值
// 2、创造子fiberNode
function updateHostRoot(workInProgress: FiberNode) {
	const baseState = workInProgress.memoizedState;
	const updateQueue = workInProgress.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	workInProgress.memoizedState = memoizedState;

	const nextChildren = workInProgress.memoizedState;
	reconcilerChildren(workInProgress, nextChildren);
	return workInProgress.child;
}

// 创造子fiberNode
function updateHostComponent(workInProgress: FiberNode) {
	const nextProps = workInProgress.pendingProps;
	const nextChildren = nextProps.children;

	reconcilerChildren(workInProgress, nextChildren);
	return workInProgress.child;
}

function reconcilerChildren(
	workInProgress: FiberNode,
	children?: ReactElementType
) {
	const current = workInProgress.alternate;
	if (current !== null) {
		// update
		workInProgress.child = reconcilerChildFibers(
			workInProgress,
			current?.child,
			children
		);
	} else {
		// mount
		workInProgress.child = mountChildFibers(workInProgress, null, children);
	}
}
