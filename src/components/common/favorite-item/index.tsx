import type { MenuProps } from 'antd'
import type { FC } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@iconify/react'
import { Dropdown } from 'antd'
import { use, useState } from 'react'
import { PersonalContext } from '@/pages/personal-center'

const dropdownList: MenuProps['items'] = [
  {
    key: 'edit',
    label: <span>编辑收藏夹</span>,
  },
  {
    key: 'delete',
    label: <span>删除</span>,
  },
]

interface FavoriteItemProps {
  id: string
  name: string
  folderStatus: boolean
  onChooseFolder: (id: string) => void
  onDeleteFolder: (id: string) => void
  onEditFolder: (id: string) => void
}

const FavoriteItem: FC<FavoriteItemProps> = ({
  id,
  name,
  folderStatus,
  onChooseFolder,
  onDeleteFolder,
  onEditFolder,
}) => {
  const { isMe } = use(PersonalContext)

  const [hovering, setHovering] = useState(false)

  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
    id,
    transition: {
      duration: 500,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })
  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const onChooseItem: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'edit':
        onEditFolder(id)
        break
      case 'delete':
        onDeleteFolder(id)
        break
      default:
        break
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={styles}
      className={`relative flex justify-between items-center w-250px h-15 cursor-pointer hover:bg-neutral-100 ${folderStatus ? 'bg-neutral-100' : 'bg-white'}`}
      onClick={() => onChooseFolder(id)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="w-full flex items-center gap-10px text-lg color-neutral-900 font-bold">
        {isMe && (
          <div
            {...listeners}
            style={{ visibility: hovering ? 'visible' : 'hidden' }}
            className="bg-neutral-100grey h-15 w-3 flex cursor-all-scroll items-center justify-center"
          >
            <Icon width="8px" color="#fff" icon="heroicons-outline:bars-3" />
          </div>
        )}
        <div className={`${isMe ? '' : 'pl-3'}`}>
          <Icon
            width="24px"
            color="#858585"
            icon={folderStatus ? 'ant-design:folder-open-filled' : 'ant-design:folder-filled'}
          />
        </div>
        <span className="w-39 overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
      </div>
      {isMe && (
        <Dropdown menu={{ items: dropdownList, onClick: onChooseItem }} placement="bottom" arrow>
          <Icon className="mr-5" width="24px" color="#858585" icon="ant-design:more-outlined" />
        </Dropdown>
      )}
    </div>
  )
}

export default FavoriteItem
