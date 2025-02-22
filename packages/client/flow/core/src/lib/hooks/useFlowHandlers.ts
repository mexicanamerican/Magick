'use client'

import { NodeSpecJSON } from '@magickml/behave-graph'
import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Node,
  OnConnectStartParams,
  XYPosition,
  useStore,
  NodeChange,
  useReactFlow,
  updateEdge,
  Connection,
  OnConnectStart,
  OnConnectEnd,
  useOnViewportChange,
  IsValidConnection,
  ReactFlowProps,
  NodeAddChange,
  NodeSelectionChange,
} from '@xyflow/react'
import { v4 as uuidv4, v4 } from 'uuid'

import { calculateNewEdge } from '../utils/calculateNewEdge'
import { getNodePickerFilters } from '../utils/getPickerFilters'
import { isValidConnection } from '../utils/isValidConnection'
import { useBehaveGraphFlow } from './useBehaveGraphFlow'
import { Tab, useTabLayout } from '@magickml/providers'
import {
  onConnect as onConnectState,
  selectLayoutChangeEvent,
  setActiveInput,
  setEdges,
  setLayoutChangeEvent,
  setNodes,
} from 'client/state'
import { getSourceSocket } from '../utils/getSocketsByNodeTypeAndHandleType'
import { useDispatch, useSelector } from 'react-redux'
import posthog from 'posthog-js'
import { getConfigFromNodeSpec } from '../utils/getNodeConfig'
import { useHotkeys } from 'react-hotkeys-hook'
import { SpellInterfaceWithGraph } from '@magickml/agent-server-schemas'
import { getNodeSpec } from '@magickml/node-spec'
import { MagickEdgeType, MagickNodeType } from '@magickml/client-types'
import { useHistory } from './useHistory'

type BehaveGraphFlow = ReturnType<typeof useBehaveGraphFlow>
type OnEdgeUpdate = (oldEdge: MagickEdgeType, newConnection: Connection) => void

const useNodePickFilters = ({
  nodes,
  lastConnectStart,
  specJSON,
}: {
  nodes: MagickNodeType[]
  lastConnectStart: OnConnectStartParams | undefined
  specJSON: NodeSpecJSON[] | undefined
}) => {
  const [nodePickFilters, setNodePickFilters] = useState(
    getNodePickerFilters(nodes, lastConnectStart, specJSON)
  )

  useEffect(() => {
    setNodePickFilters(getNodePickerFilters(nodes, lastConnectStart, specJSON))
  }, [nodes, lastConnectStart, specJSON])

  return nodePickFilters
}

function calculateOffsetPosition(
  node: { position: XYPosition; width: number; height: number },
  parentNode: MagickNodeType
) {
  // Ensure both node and parentNode have necessary properties
  if (!node || !parentNode || !parentNode.position || !node.position) {
    return null
  }

  // Calculate the new position relative to the parent node
  const newPosition = {
    x: node.position.x - parentNode.position.x,
    y: node.position.y - parentNode.position.y - 200,
  }

  return newPosition
}

export const useFlowHandlers = ({
  onEdgesChange,
  onNodesChange,
  nodes,
  edges,
  specJSON,
  parentRef,
  tab,
  windowDimensions,
  spell,
}: Pick<BehaveGraphFlow, 'onEdgesChange' | 'onNodesChange'> & {
  nodes: MagickNodeType[]
  edges: MagickEdgeType[]
  specJSON: NodeSpecJSON[] | undefined
  parentRef: React.RefObject<HTMLDivElement>
  tab: Tab
  windowDimensions: { width: number; height: number }
  spell: SpellInterfaceWithGraph
}) => {
  const [lastConnectStart, setLastConnectStart] =
    useState<OnConnectStartParams>()
  const [pickedNodeVisibility, setPickedNodeVisibility] = useState<XYPosition>()
  const [nodePickerPosition, setNodePickerPosition] = useState<XYPosition>()
  const [nodeMenuVisibility, setNodeMenuVisibility] = useState<XYPosition>()
  const [openNodeMenu, setOpenNodeMenu] = useState(false)
  const [blockClose, setBlockClose] = useState(false)
  const [socketsVisible, setSocketsVisible] = useState(true)
  const [targetNodes, setTargetNodes] = useState<Node[] | undefined>(undefined)
  const rfDomNode = useStore(state => state.domNode)
  const [currentKeyPressed, setCurrentKeyPressed] = useState<string | null>(
    null
  )
  const mousePosRef = useRef<XYPosition>({ x: 0, y: 0 })
  const instance = useReactFlow<MagickNodeType, MagickEdgeType>()
  const { screenToFlowPosition, getNodes, getIntersectingNodes } = instance
  const layoutChangeEvent = useSelector(selectLayoutChangeEvent)
  const dispatch = useDispatch()

  const { isTabActive } = useTabLayout()

  const setTabEdges = useCallback(
    (edges: MagickEdgeType[]) => {
      setEdges(tab.id, edges)
    },
    [tab.id]
  )

  const setTabNodes = useCallback(
    (nodes: MagickNodeType[]) => {
      setNodes(tab.id, nodes)
    },
    [tab.id]
  )

  const { undo, redo, takeSnapshot } = useHistory({
    setEdges: setTabEdges as (edges: MagickEdgeType[]) => void,
    setNodes: setTabNodes as (nodes: MagickNodeType[]) => void,
    edges,
    nodes,
  })

  useHotkeys('Meta+z', () => {
    if (!isTabActive(tab.id)) return
    undo()
  })

  useHotkeys('Meta+Shift+z', () => {
    if (!isTabActive(tab.id)) return
    redo()
  })

  useHotkeys('meta+c, ctrl+c', () => {
    if (!isTabActive(tab.id)) return
    copy()
  })
  useHotkeys('meta+v, ctrl+v', () => {
    if (!isTabActive(tab.id)) return
    paste()
  })

  useOnViewportChange({
    onStart: () => {
      closeNodePicker()
    },
  })

  useEffect(() => {
    // record current key pressed event
    const onKeyDown = (event: KeyboardEvent) => {
      setCurrentKeyPressed(event.key)
    }
    const onKeyUp = () => {
      setCurrentKeyPressed(null)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    if (layoutChangeEvent) {
      closeNodePicker()
      dispatch(setLayoutChangeEvent(false))
    }
  }, [layoutChangeEvent])

  useEffect(() => {
    if (rfDomNode) {
      const onMouseMove = (event: MouseEvent) => {
        mousePosRef.current = {
          x: event.clientX,
          y: event.clientY,
        }
      }

      rfDomNode.addEventListener('mousemove', onMouseMove)

      return () => {
        rfDomNode.removeEventListener('mousemove', onMouseMove)
      }
    }
  }, [rfDomNode])

  const handleNodeDragStart = useCallback(() => {
    takeSnapshot()
  }, [takeSnapshot])

  const handleSelectionDragStart = useCallback(() => {
    takeSnapshot()
  }, [takeSnapshot])

  const handleDelete = useCallback(() => {
    console.log('TAB ACTIVE', !isTabActive(tab.id))
    if (!isTabActive(tab.id)) return
    takeSnapshot()
  }, [takeSnapshot, tab])

  const onBeforeDelete = useCallback<() => Promise<boolean>>(async () => {
    return isTabActive(tab.id)
  }, [tab, takeSnapshot])

  const closeNodePicker = useCallback(() => {
    setLastConnectStart(undefined)
    setNodePickerPosition(undefined)
    setPickedNodeVisibility(undefined)
  }, [])

  const onEdgeUpdate = useCallback<OnEdgeUpdate>(
    (oldEdge, newConnection) => {
      return setEdges(tab.id, (edges: MagickEdgeType[]) => {
        const newEdges = updateEdge(oldEdge, newConnection, edges)
        return newEdges
      })
    },
    [nodes, instance]
  )

  const handleOnConnect = useCallback(
    (_connection: Connection) => {
      takeSnapshot()
      const connection = {
        ..._connection,
        type: 'custom-edge',
        updatable: true,
      }

      // get source node
      const sourceNode = nodes.find(node => node.id === connection.source)
      const sourceSocket =
        sourceNode &&
        specJSON &&
        getSourceSocket(connection, sourceNode, specJSON)

      // @ts-ignore
      connection.data = {
        valueType: sourceSocket?.valueType,
      }

      posthog.capture('node_connected', {
        spellId: tab.spellName,
      })

      // if the source socket is not a flow socket, we don't need to do anything special
      if (sourceSocket === undefined || sourceSocket.valueType !== 'flow') {
        onConnectState(tab.id)(connection)
        return
      }

      const sourceEdge = edges.find(
        edge =>
          edge.source === connection.source &&
          edge.sourceHandle === connection.sourceHandle
      )

      if (sourceEdge) {
        // If we make it here, we know that the source socket is a flow socket
        // We want to remove any existing edges that are connected to the source socket
        // and replace them with the new flow type edge
        onEdgesChange(tab.id)([
          {
            type: 'remove',
            id: sourceEdge.id,
          },
        ])
      }

      onConnectState(tab.id)(connection)
      return
    },
    [tab, nodes, edges]
  )

  const isValidConnectionHandler: IsValidConnection = useCallback(
    connection => {
      const newNode = nodes.find(node => node.id === connection.target)
      if (!newNode || !specJSON) return false
      return isValidConnection(connection, instance, specJSON)
    },
    [instance, nodes, specJSON]
  )

  const handleAddComment = useCallback(
    (position: XYPosition) => {
      const newNode = {
        id: uuidv4(),
        type: 'comment',
        position,
        data: {
          text: '',
          cxonfiguration: {},
        },
      }
      onNodesChange(tab.id)([
        {
          type: 'add',
          item: newNode,
        },
      ])
    },
    [closeNodePicker, onNodesChange, tab.id]
  )

  const handleAddNode = useCallback(
    (_nodeType: string, position: XYPosition, _nodeSpec?: NodeSpecJSON) => {
      closeNodePicker()
      takeSnapshot()
      const fullSpecJSON = getNodeSpec(spell)
      // handle add configuration here so we don't need to do it in the node.
      const nodeSpecRaw =
        _nodeSpec || fullSpecJSON?.find(spec => spec.type === _nodeType)

      const nodeSpec = { ...nodeSpecRaw } as NodeSpecJSON

      if (!nodeSpec) return

      let nodeType = _nodeType
      const regex = new RegExp(`^variables/(get|set|on)/(.+)$`)

      if (nodeType.match(regex)) {
        const variableType = nodeType.replace(
          /^(variables\/(get|set|on))\/(.+)$/,
          '$1'
        )
        nodeSpec.type = variableType
        nodeType = variableType
      }

      const newNode = {
        id: uuidv4(),
        type: nodeType,
        position,
        data: {
          configuration: nodeSpec ? getConfigFromNodeSpec(nodeSpec) : {},
        },
      }
      onNodesChange(tab.id)([
        {
          type: 'add',
          item: newNode,
        },
      ])

      posthog.capture('node_added', {
        nodeType,
      })

      if (lastConnectStart === undefined) return

      // add an edge if we started on a socket
      const originNode = nodes.find(node => node.id === lastConnectStart.nodeId)
      if (originNode === undefined) return
      if (!specJSON) return

      // repopulate the specJSON with variable nodes if a spell is provided
      // this is to handle the case where a variable node is being connected
      const newEdge = calculateNewEdge(
        originNode,
        _nodeType,
        newNode.id,
        lastConnectStart,
        fullSpecJSON
      )

      onEdgesChange(tab.id)([
        {
          type: 'add',
          item: newEdge,
        },
      ])
    },
    [
      closeNodePicker,
      lastConnectStart,
      nodes,
      onEdgesChange,
      onNodesChange,
      specJSON,
      spell,
    ]
  )

  const handleRemoveNode = () => {
    if (!targetNodes?.length) return

    const newNodes = nodes.filter(
      node => !targetNodes.some(targetNode => targetNode.id === node.id)
    )

    const newEdges = edges.filter(
      edge =>
        !targetNodes.some(
          node => node.id === edge.source || node.id === edge.target
        )
    )

    setNodes(tab.id, newNodes)
    setEdges(tab.id, newEdges)
    setTargetNodes(undefined)
  }

  const cloneNode = useCallback(() => {
    if (!targetNodes?.length) return
    takeSnapshot()

    const newNodes: NodeAddChange<MagickNodeType>[] = targetNodes.map(node => {
      const id = uuidv4()
      const x = node.position.x + 10
      const y = node.position.y + 10

      return {
        type: 'add',
        item: {
          ...node,
          id,
          position: { x, y },
          positionAbsolute: { x, y },
          selected: true,
          data: {
            ...node.data,
            configuration: node.data.configuration
              ? { ...node.data.configuration }
              : {},
          },
        },
      }
    })

    // Deselect all existing nodes
    const deselectNodes: NodeSelectionChange[] = getNodes().map(node => ({
      id: node.id,
      type: 'select',
      selected: false,
    }))

    // Apply node changes: deselect all existing nodes and add new nodes
    onNodesChange(tab.id)([...deselectNodes, ...newNodes])

    setTargetNodes(undefined)
  }, [targetNodes, getNodes, onNodesChange, tab.id, takeSnapshot])

  const copy = useCallback(() => {
    const selectedNodes = getNodes().filter(node => node.selected)

    if (!selectedNodes.length) return

    // Create a deep copy of the nodes without any connection information
    const nodesToCopy = selectedNodes.map(node => ({
      ...node,
      id: node.id,
      position: { ...node.position },
      data: {
        ...node.data,
        configuration: node.data.configuration
          ? { ...node.data.configuration }
          : {},
      },
      selected: false,
    }))

    localStorage.setItem(
      'copiedNodes',
      JSON.stringify({
        nodes: nodesToCopy,
      })
    )
    setTargetNodes(undefined)
  }, [getNodes])
  const handleStartConnect: OnConnectStart = useCallback(
    (e, params) => {
      setLastConnectStart(params)
    },
    [getNodes]
  )

  const paste = useCallback(() => {
    const copiedData = localStorage.getItem('copiedNodes')
    if (!copiedData) return

    const { nodes: copiedNodes } = JSON.parse(copiedData)
    const { x: pasteX, y: pasteY } = screenToFlowPosition({
      x: mousePosRef.current.x,
      y: mousePosRef.current.y,
    })

    const minX = Math.min(...copiedNodes.map((node: any) => node.position.x))
    const minY = Math.min(...copiedNodes.map((node: any) => node.position.y))

    const newNodes: NodeChange[] = copiedNodes.map((node: any) => {
      const id = uuidv4()
      const x = pasteX + (node.position.x - minX)
      const y = pasteY + (node.position.y - minY)
      return {
        type: 'add',
        item: {
          ...node,
          id,
          position: { x, y },
          positionAbsolute: { x, y },
          selected: true,
          data: {
            ...node.data,
            configuration: node.data.configuration
              ? { ...node.data.configuration }
              : {},
          },
        },
      }
    })

    // Deselect all existing nodes
    const deselectNodes: NodeChange[] = getNodes().map(node => ({
      id: node.id,
      type: 'select',
      selected: false,
    }))

    onNodesChange(tab.id)([...deselectNodes, ...newNodes])
  }, [screenToFlowPosition, onNodesChange, tab.id, getNodes])

  const nodeMenuActions = [
    { label: 'Delete', onClick: handleRemoveNode },
    { label: 'Clone', onClick: cloneNode },
    { label: 'Copy', onClick: copy },
    { label: 'Paste', onClick: paste },
  ]

  const handleStopConnect: OnConnectEnd = useCallback(
    event => {
      setBlockClose(true)
      event.preventDefault()
      const element = event.target as HTMLElement

      // Check if the connection ended on a valid target (another node)
      const isValidTarget =
        element.classList.contains('react-flow__handle') ||
        element.classList.contains('react-flow__node') ||
        element.closest('.react-flow__node') !== null

      if (!isValidTarget && element.classList.contains('react-flow__pane')) {
        const bounds = parentRef?.current?.getBoundingClientRect()

        if (!bounds) return

        let clientX, clientY

        if (event instanceof MouseEvent) {
          clientX = event.clientX
          clientY = event.clientY
        } else if (event instanceof TouchEvent && event.touches.length > 0) {
          clientX = event.touches[0].clientX
          clientY = event.touches[0].clientY
        }

        if (!clientX || !clientY) return

        const nodePickerWidth = 320
        const nodePickerHeight = 251

        let xNodePickerPosition = clientX - bounds.left
        let yNodePickerPosition = clientY - bounds.top

        const { x: xPosition, y: yPosition } = screenToFlowPosition({
          x: clientX,
          y: clientY,
        })

        if (xNodePickerPosition + nodePickerWidth > bounds.width) {
          xNodePickerPosition = bounds.width - nodePickerWidth * 1.05
        }

        if (yNodePickerPosition + nodePickerHeight > bounds.height) {
          yNodePickerPosition = bounds.height - nodePickerHeight * 1.05
        }

        setPickedNodeVisibility({
          x: xPosition,
          y: yPosition,
        })

        if (!currentKeyPressed) {
          setNodePickerPosition({
            x: Math.max(0, xNodePickerPosition + bounds.left),
            y: Math.max(0, yNodePickerPosition + bounds.top),
          })
        }

        setTimeout(() => {
          setBlockClose(false)
        }, 500)
      } else {
        setLastConnectStart(undefined)
      }
    },
    [parentRef, currentKeyPressed, screenToFlowPosition]
  )

  const nodeCreator = (
    event: { clientX: any; clientY: any },
    keyPressed: string
  ) => {
    switch (keyPressed) {
      case 'b':
        handleAddNode(
          'flow/branch',
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      case 't': {
        handleAddNode(
          'logic/string/template',
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      }
      case 's': {
        handleAddNode(
          'magick/sendMessage',
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      }
      case 'm': {
        handleAddNode(
          'magick/onMessage',
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      }
      case 'g':
        handleAddNode(
          'magick/generateText',
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      case 'a':
        handleAddNode(
          'action/memory/addMemory',
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      case 'c':
        handleAddComment(
          screenToFlowPosition({ x: event.clientX, y: event.clientY })
        )
        break
      default:
        return false
    }
    setLastConnectStart(undefined)
    return true
  }

  const handlePaneClick = useCallback(
    (e: ReactMouseEvent) => {
      if (currentKeyPressed) {
        nodeCreator(e, currentKeyPressed)
        closeNodePicker()
      }

      if (blockClose) return

      closeNodePicker()
      dispatch(setActiveInput(null))
    },
    [closeNodePicker, currentKeyPressed, blockClose]
  )

  const handlePaneContextMenu: ReactFlowProps['onPaneContextMenu'] =
    useCallback(
      (mouseClick: {
        preventDefault: () => void
        clientX: number
        clientY: number
      }) => {
        mouseClick.preventDefault()
        if (parentRef && parentRef.current) {
          const bounds = parentRef.current.getBoundingClientRect()

          const nodePickerWidth = 320
          const nodePickerHeight = 251

          // Calculate initial positions, ensuring the node picker doesn't open off-screen initially
          let xNodePickerPosition = mouseClick.clientX - bounds.left
          let yNodePickerPosition = mouseClick.clientY - bounds.top

          const { x: xPosition, y: yPosition } = screenToFlowPosition({
            x: mouseClick.clientX,
            y: mouseClick.clientY,
          })

          // Adjust if the context menu would open off the right side of the viewport
          if (xNodePickerPosition + nodePickerWidth > bounds.width) {
            xNodePickerPosition = bounds.width - nodePickerWidth * 1.05
          }

          // Adjust if the context menu would open off the bottom of the viewport
          if (yNodePickerPosition + nodePickerHeight > bounds.height) {
            yNodePickerPosition = bounds.height - nodePickerHeight * 1.05
          }

          setPickedNodeVisibility({
            x: xPosition,
            y: yPosition,
          })
          setNodePickerPosition({
            x: Math.max(0, xNodePickerPosition + bounds.left), // Use Math.max to ensure we don't position off-screen
            y: Math.max(0, yNodePickerPosition + bounds.top), // Use Math.max to ensure we don't position off-screen
          })
        }
      },
      [parentRef, windowDimensions]
    )

  const nodePickFilters = useNodePickFilters({
    nodes,
    lastConnectStart,
    specJSON,
  })

  const handleNodeContextMenu = useCallback(
    (e: ReactMouseEvent, node: Node) => {
      if (lastConnectStart) return

      const selectedNodes = getNodes().filter(node => node.selected)
      e.preventDefault()
      e.stopPropagation()

      setNodeMenuVisibility({
        x: e.clientX,
        y: e.clientY,
      })

      setTargetNodes(selectedNodes)
      setOpenNodeMenu(true)
    },
    []
  )

  const toggleSocketVisibility = useCallback(() => {
    const newState = !socketsVisible
    setSocketsVisible(newState)

    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        socketsVisible: newState,
      },
    })) as Node[]

    setNodes(tab.id, updatedNodes)

    // onNodesChange(tab.id)(updatedNodes)
  }, [socketsVisible, nodes, setNodes])

  const handleNodeDrag = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, node: MagickNodeType) => {
      // Get all intersecting nodes that are of type 'group'
      // const intersectingNodes = getIntersectingNodes(node).filter(
      //   intersectingNode => intersectingNode.type === 'group'
      // )
      // // Determine if the node should be marked as active
      // const className =
      //   intersectingNodes.length && node.parentId !== intersectingNodes[0]?.id
      //     ? 'active'
      //     : ''
      // const newNodes = getNodes().map(currentNode =>
      //   currentNode.id === node.id ? { ...currentNode, className } : currentNode
      // )
      // // Update the nodes state
      // setNodes(tab.id, newNodes)
    },
    [getIntersectingNodes, setNodes]
  )

  const onDragOver = useCallback((event: React.DragEvent<Element>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = (event: React.DragEvent<Element>) => {
    console.log('drop!')
    const type = event.dataTransfer.getData('application/reactflow')
    const position = screenToFlowPosition({
      x: event.clientX - 20,
      y: event.clientY - 20,
    })
    const style = type === 'group' ? { width: 400, height: 200 } : undefined
    const intersectingNodes = getIntersectingNodes({
      x: position.x,
      y: position.y,
      width: 40,
      height: 40,
    }).filter(node => node.type === 'group')
    const parentNode = intersectingNodes[0]
    const newNode: MagickNodeType = {
      id: v4(),
      type: type,
      position: position,
      data: { label: `${type}` },
      style: style,
    }
    if (parentNode) {
      newNode.position = calculateOffsetPosition(
        { position, width: 40, height: 40 },
        parentNode
      ) || { x: 0, y: 0 }
      newNode.parentId = parentNode.id
      newNode.expandParent = true
    }
    const updatedNodes = getNodes().concat(newNode)
    setNodes(tab.id, updatedNodes)
  }

  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, node: MagickNodeType) => {
      if (node.type !== 'node' && !node.parentId) {
        return
      }

      const intersectingNodes = getIntersectingNodes(node).filter(
        intersectingNode => intersectingNode.type === 'group'
      )
      const parentGroup = intersectingNodes[0]

      if (
        intersectingNodes.length &&
        node.parentId !== (parentGroup ? parentGroup.id : null)
      ) {
        const updatedNodes = getNodes().map(currentNode => {
          if (currentNode.id === parentGroup.id) {
            return {
              ...currentNode,
              className: '',
            }
          }
          if (currentNode.id === node.id) {
            const newPosition = calculateOffsetPosition(
              {
                position: node.position,
                width: node.width as number,
                height: node.height as number,
              },
              parentGroup
            ) || { x: 0, y: 0 }
            return {
              ...currentNode,
              position: newPosition,
              parentNode: parentGroup.id,
              extent: 'parent' as const,
            }
          }
          return currentNode
        })

        setNodes(tab.id, updatedNodes)
      }
    },
    [getIntersectingNodes, setNodes]
  )

  return {
    handleOnConnect,
    onEdgeUpdate,
    isValidConnectionHandler,
    handleStartConnect,
    handleStopConnect,
    handlePaneClick,
    handlePaneContextMenu,
    lastConnectStart,
    nodePickerPosition,
    pickedNodeVisibility,
    handleAddNode,
    handleNodeDrag,
    closeNodePicker,
    nodePickFilters,
    onBeforeDelete,
    handleNodeContextMenu,
    nodeMenuVisibility,
    setNodeMenuVisibility,
    setOpenNodeMenu,
    openNodeMenu,
    nodeMenuActions,
    handleAddComment,
    toggleSocketVisibility,
    socketsVisible,
    handleDelete,
    handleNodeDragStart,
    handleSelectionDragStart,
    handleDrop,
    onDragOver,
    handleNodeDragStop,
  }
}
