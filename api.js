
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    getDocs,
    query,
    where
} from 'firebase/firestore/lite'

// Firebase has a suite of features that allows for real time data-fetching
// which are really useful for things like a chat function where the 
// conversation can be updated in real time without needing to constantly re-render the app 

const firebaseConfig = {
  apiKey: "AIzaSyAbAFaE8tyiy5NRgxxnLhosuug9xs0TrKQ",
  authDomain: "vanlife-871d6.firebaseapp.com",
  projectId: "vanlife-871d6",
  storageBucket: "vanlife-871d6.firebasestorage.app",
  messagingSenderId: "230906880498",
  appId: "1:230906880498:web:4108242fd60a93bbcf8b6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

// this is from Bob's preference to not have to work with nested functions when dealing with the 'collection' function. This is making a reference to the 'vans' collection that is returned from the Firebase db. Not sure how this is any different but hey ho.
// this is fetching (sort of?!) the 'vans' collection I created in Firebase
const vansCollectionRef = collection(db, 'vans')

export async function getVans() {
    // getDocs returns a promise we need to use await. It returns a "snapshot" of our data as an array from whatever source we provide. 
    const snapshot = await getDocs(vansCollectionRef)
 
    // this is "rearranging" the data to a structure that is more in keeping with what the rest of the code is expecting to deal with. Partly due to having been written to handle the data in the form that Mirage JS returned which is different to how Firebase natively returns data.
    // .data() is a method on the object returned by getDocs(). It returns all the fields in the object
    // REMEMBER THIS: This is returning a new object which is why the {} are wrapped in () to otherwise JS would think we're trying to access the 'doc' object. 
    // The spread operator is bieng used because otherwise using .data() on it's own would return an object nested within the new object being returned by using the ({}) syntax as explained above
    // the data returned by 'snapshot.docs' doesn't include the id property for some reason so it's being added in after using spread operator in conjunction with .data()
    const vans = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
    }))
   return vans
}

export async function getVan(id) {
    const docRef = doc(db, 'vans', id)
    const snapshot = await getDoc(docRef)

    return {
        ...snapshot.data(),
        id: doc.id
    }
}

export async function getHostVans() {
    // THIS HELPED ME FINALLY FIGURE OUT WHAT WAS WRONG WITH THE QUERY APPROACH BELOW!
    // const snapshot = await getDocs(vansCollectionRef)
    // const vanList = snapshot.docs.map(doc => ({
    //     ...doc.data(),
    //     id: doc.id
    // }))
    // const hostVans = vanList.filter((van) => van.hostId === '"123"')
   

    // THE QUERY DOESN'T WORK. CAN'T FIGURE OUT WHY.
    // Eventually worked out that '123' needed to be written as '"123"' because that was how I had written it in Firebase mistakenly thinking as it was a string I needed to include "" when adding the entry :( I actually thought I had tried '"123"' previously as I noticed that was how it was being returned by query but I think I had maybe also written hostID as '"hostId"' as well which DOESN'T work?!?!??!
        // this is creating a filtered list of vans from the main DB by using the 'query' and 'where' methods from Firebase
        const test = '123'
        const q = query(vansCollectionRef, where("hostId", "==", test))
        const snapshot1 = await getDocs(q)   
        const vans = snapshot1.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))
        return vans
}

export async function loginUser(creds) {
    const res = await fetch("/api/login",
        { method: "post", body: JSON.stringify(creds) }
    )
    const data = await res.json()

    if (!res.ok) {
        throw {
            message: data.message,
            statusText: res.statusText,
            status: res.status
        }
    }

    return data
}

// OLD/DIFFERENT WAYS TO FORMAT FETCH REQUESTS
// export async function getVans(id) {
//     const url = id ? `/api/vans/${id}` : "/api/vans"
//     const res = await fetch(url)
//     if (!res.ok) {
//         throw {
//             message: "Failed to fetch vans",
//             statusText: res.statusText,
//             status: res.status
//         }
//     }
//     const data = await res.json()
//     return data.vans
// }

// export async function getHostVans(id) {
//     const url = id ? `/api/host/vans/${id}` : "/api/host/vans"
//     const res = await fetch(url)
//     if (!res.ok) {
//         throw {
//             message: "Failed to fetch vans",
//             statusText: res.statusText,
//             status: res.status
//         }
//     }
//     const data = await res.json()
//     return data.vans
// }
