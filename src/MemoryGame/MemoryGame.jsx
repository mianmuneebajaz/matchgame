import { useState, useEffect } from 'react'
import './MemoryGame.css'
import SingleCard from '../SingleCard'
import QRCode from "react-qr-code";
// import StartFirebase from "./firebaseConfig/index"
import { ref, set, get, update, remove, child, onValue, getDatabase } from "firebase/database";

import { v4 as uuidv4 } from 'uuid';

const cardImages = [
    { "src": "/img/helmet-1.png", matched: false },
    { "src": "/img/potion-1.png", matched: false },
    { "src": "/img/ring-1.png", matched: false },
    { "src": "/img/scroll-1.png", matched: false },
    { "src": "/img/shield-1.png", matched: false },
    { "src": "/img/sword-1.png", matched: false },
]

export default function MemoryGame(props) {

    const { app, database } = props;

    const [cards, setCards] = useState([])
    const [turns, setTurns] = useState(0)
    const [choiceOne, setChoiceOne] = useState(null)
    const [choiceTwo, setChoiceTwo] = useState(null)
    const [disabled, setDisabled] = useState(false)
    const [gameId, setGameId] = useState(null)

    // handle a choice
    const handleChoice = (card) => {
        console.log(card)
        choiceOne ? setChoiceTwo(card) : setChoiceOne(card)
    }

    // compare 2 selected cards
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true)

            if (choiceOne.src === choiceTwo.src) {
                setCards(prevCards => {
                    return prevCards.map(card => {
                        if (card.src === choiceOne.src) {
                            return { ...card, matched: true }
                        } else {
                            return card
                        }
                    })
                })
                resetTurn()
            } else {
                setTimeout(() => resetTurn(), 1000)
            }

        }
    }, [choiceOne, choiceTwo])

    // reset choices & increase turn
    const resetTurn = () => {
        setChoiceOne(null)
        setChoiceTwo(null)
        setTurns(prevTurns => prevTurns + 1)
        setDisabled(false)
    }

    const startNewGameInstance = () => window.location.href = `/${uuidv4()}`;

    const startNewGame = (obj) => {
        if (!!obj) {
            // Resuming the game

            // When data is loaded from firebase we need to set the state
            setChoiceOne(null)
            setChoiceTwo(null)
            setCards(obj.cards)
            setTurns(obj.turns)

            return;
        }

        if (gameId) {
            // If we have a game id we need to create a new game
            const shuffledCards = [...cardImages, ...cardImages]
                .sort(() => Math.random() - 0.5)
                .map(card => ({ ...card, id: Math.random() }))

            const gameRef = ref(database, `games/${gameId}`);
            update(gameRef, {
                id: gameId,
                startedAt: new Date().toISOString(),
                cards: shuffledCards,
                turns: 0
            });

            setChoiceOne(null)
            setChoiceTwo(null)
            setCards(shuffledCards)
            setTurns(0)
        }
    }

    // #region Pipeline
    // 1 - We need game if, if there is no game id 
    useEffect(() => {
        const gameId_ = window.location.pathname.split("/")[1];
        if (gameId_ && gameId_.length === 36) {
            setGameId(gameId_);
        }
        else {
            // Navigate user to new game id
            window.location.pathname = uuidv4();
        }
    }, []);
    // 2 - Whenever game id is changed, we need to get game data from firebase and start/continue game
    useEffect(() => {
        if (gameId && gameId.length === 36) {
            const dbRef = ref(getDatabase());
            get(child(dbRef, `games/${gameId}`)).then((snapshot) => {
                //* its going to be triggered even database don't have any data
                if (snapshot.exists()) {
                    startNewGame(snapshot.val())
                    console.log();
                } else {
                    console.log("No game available");
                    startNewGame()
                }
            }).catch(() => {
                alert('Unable to connect to server, please try again later.')
            });
        }
    }, [gameId]);

    useEffect(() => {
        // 1 - update cards in database
    }, [cards]);

    // useEffect(() => {
    //   const sub = onValue('/games/' + ga meId, (newValue) => {
    //     // update local states here
    //   })

    //   return () => {
    //     // unsubscribe 
    //     sub();
    //   }
    // }, []);

    //#endregion

    return (
        <div className="MemoryGameContainer">
            <h1 className="center">Magic Match</h1>
            <br />
            <div style={{ height: "auto", margin: "0 auto", maxWidth: 150, padding: '10px', backgroundColor: "white" }}>
                <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={window.location.href}
                    viewBox={`0 0 256 256`}
                />
            </div>
            <br />
            <div className='center'>
                <button onClick={startNewGameInstance}>New Game</button>
                <p className='turns-label'>Turns: {turns}</p>
            </div>
            <div className="card-grid">
                {cards.map(card => (
                    <SingleCard
                        key={card.id}
                        card={card}
                        handleChoice={handleChoice}
                        flipped={card === choiceOne || card === choiceTwo || card.matched}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
}
