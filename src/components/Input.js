import { FaceSmileIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import React, { useRef, useState } from 'react'
import { db, storage } from '@/firebase'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'
import { userState } from '../atoms/userAtom'
import { useRecoilState } from 'recoil'
import { signOut } from 'next-auth/react'
import { getAuth } from 'firebase/auth'

export default function Input() {

	const auth = getAuth()
	const [currentUser, setCurrentUser] = useRecoilState(userState)

	const filePickerRef = useRef(null)

	const [input, setInput] = useState("")
	const [selectedFile, setSelectedFile] = useState(null)
	const [loading, setLoading] = useState(false)

	const sendPost = async () => {

		if(loading) return;
		setLoading(true)

		const docRef = await addDoc(collection(db, "posts"),{
			id: currentUser.uid,
			text: input,
			userImg: currentUser.userImg,
			timestamp: serverTimestamp(),
			name: currentUser.name,
			username: currentUser.username
		})

		const imageRef = ref(storage, `posts/${docRef.id}/image`)

		if (selectedFile) {
			await uploadString(imageRef, selectedFile, "data_url").then(async()=>{
				const downloalURL = await getDownloadURL(imageRef)
				await updateDoc(doc(db, "posts", docRef.id), {
					image: downloalURL
				})
			})
		}

		setInput("")
		setSelectedFile(null)
		setLoading(false)
	}

	const addImageToPost = async (e) => {
		const reader = new FileReader();

		if(e.target.files[0]) {
			reader.readAsDataURL(e.target.files[0]);
		}

		reader.onload = (readerEvent) => {
			setSelectedFile(readerEvent.target.result);
		}
	}

	const onSignOut = async() => {
		await signOut(auth)
        setCurrentUser(null)
	}
	
	return (
		<>
			{
				currentUser && <div className='flex border-b border-grey-200 p-3 space-x-3'>
					<img className='h-11 w-11 rounded-full cursor-pointer hover:brightness-95' src={currentUser?.userImg} alt='user image' onClick={onSignOut} />

					<div className='w-full divide-y divide-gray-200' >
						<div className='' >
							<textarea className='w-full border-none focus:ring-0 text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-grey-700' rows='2' placeholder="What's happening" value={input} onChange={(e)=>setInput(e.target.value)}></textarea>
						</div>
						{
							selectedFile && (
								<div className='relative'>
									<XMarkIcon className='h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full border' onClick={() => setSelectedFile(null)} />
									<img src={selectedFile} alt="" className={`${loading && "animate-pulse"}`} />
								</div>
							)
						}
						<div className='flex items-center justify-between pt-2.5' >
							{
								!loading && (
									<>
										<div className='flex ' >
											<div onClick={() => filePickerRef.current.click()}>
												<PhotoIcon className='h-10 w-10 hover hoverEffect p-2 text-sky-500 hover:bg-sky-100' />
												<input type="file" hidden ref={filePickerRef} onChange={addImageToPost}/>
											</div>
											<FaceSmileIcon className='h-10 w-10 hoverEffect p-2 text-sky-500 hover:bg-sky-100' />
										</div>
										<button className='bg-blue-400 text-white px-5 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50' disabled={!input.trim()} onClick={sendPost}>Tweet</button>
									</>
								)
							}
							
						</div>
					</div>
				</div>
			}
		</>
		
	)
}
