'use client'

import Link from "next/link";
import { useRouter } from 'next/navigation'



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
             <Link href="/home">Dashboard</Link>
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
        });

    }

    return(
        <>
            <main >        
                <section>
                    <div>                                            
                        <p> FocusApp </p>                       

                        <form>                                              
                            <div>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"                                    
                                    required                                                                                
                                    placeholder="Email address"
                                    onChange={(e)=>setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"                                    
                                    required                                                                                
                                    placeholder="Password"
                                    onChange={(e)=>setPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <button                                    
                                    onClick={onLogin}                                        
                                >      
                                    Login                                                                  
                                </button>
                            </div>                               
                        </form>

                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <Link to="/signup">
                                Sign up
                            </Link>
                        </p>

                    </div>
                </section>
            </main>
        </>
    )
}

export default Login
