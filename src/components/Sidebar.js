import Image from 'next/image'
import SidebarMenuItem from './SidebarMenuItem'
import { HomeIcon } from '@heroicons/react/24/solid'
import { BellIcon, BookmarkIcon, ClipboardIcon, EllipsisHorizontalCircleIcon, EllipsisHorizontalIcon, HashtagIcon, InboxIcon, UserIcon } from '@heroicons/react/24/outline'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { useRecoilState } from 'recoil'
import { userState } from '@/atoms/userAtom'
import { db } from '@/firebase'
import { useRouter } from 'next/router'

export default function Sidebar() {

	const auth = getAuth()
	const router = useRouter()

	const [currentUser, setCurrentUser] = useRecoilState(userState)

	useEffect(()=>{
		onAuthStateChanged(auth, async (user)=>{
			if(user){
				const docRef = doc(db, "users", auth.currentUser.providerData[0].uid)
				const docSnap = await getDoc(docRef)
				if(docSnap.exists()){
					setCurrentUser(docSnap.data())
				}
			}
		})
	},[])

	const onSignOut = async() => {
		await signOut(auth)
        setCurrentUser(null)
	}

	return (
		<div className='hidden sm:flex flex-col p-2 xl:items-start fixed h-full xl:ml-24'>
			
			<div className='hoverEffect p-0 hover:bg-blue-100 xl:px-1'>
				<Image src="/twitter_logo.png" width="50" height="50" alt='logo'/>
			</div>

			<div className='mt-4 mb-2.5 xl:items-start'>
				<SidebarMenuItem text="Home" Icon={HomeIcon} active/>
				<SidebarMenuItem text="Explore" Icon={HashtagIcon} />

				{
					currentUser && (
						<>
							<SidebarMenuItem text="Notifications" Icon={BellIcon} />
							<SidebarMenuItem text="Messages" Icon={InboxIcon} />
							<SidebarMenuItem text="Bookmark" Icon={BookmarkIcon} />
							<SidebarMenuItem text="Lists" Icon={ClipboardIcon} />
							<SidebarMenuItem text="Profile" Icon={UserIcon} />
							<SidebarMenuItem text="More" Icon={EllipsisHorizontalCircleIcon} />
						</>
					)
				}
				
			</div>

			{
				currentUser ? (
                    <>
						<button className='bg-blue-400 text-white rounded-full w-56 h-12 font-bold shadow-md hover:brightness-95 text-lg hidden xl:inline'>Tweet</button>

						<div className='hoverEffect text-gray-700 flex items-center justify-center xl:justify-start mt-auto'>
							<img className='h-10 w-10 rounded-full xl:mr-2' src={currentUser.userImg} alt='User Image' onClick={onSignOut}/>
							<div className='leading-5 hidden xl:inline'>
								<h4 className='font-bold '>{currentUser.name}</h4>
								<p className='text-grey-500'>@{currentUser.username}</p>
							</div>
							<EllipsisHorizontalIcon className='h-5 xl:ml-8 hidden xl:inline'/>
						</div>
                    </>
                ) : (
					<>
						<button className='bg-blue-400 text-white rounded-full w-36 h-12 font-bold shadow-md hover:brightness-95 text-lg hidden xl:inline' onClick={()=>router.push("/auth/signin")}>Sign In</button>
					</>
				)
			}

			

		</div>
	)
}
