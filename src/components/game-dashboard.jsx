"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from 'pixel-retroui';
import { Card } from 'pixel-retroui';
import { CardContent } from "@/components/ui/card"
import { Gamepad2} from "lucide-react"

import {
  Brain,
  Send,
  Trophy,
  MessageSquare,
  Zap,
  Clock,
  Users,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { LandingPage } from "./landing-page";
import { GameInfoComponent } from "./game-info";
import { GamePage } from "./game-page";
import { RetroQuizList } from "./retro-quiz-list";

const initialMessages = [
  { user: "Bhawna Chauhan", message: "Good luck everyone!" },
  { user: "Rohit", message: "This is fun!" },
  { user: "Harsh Kumar", message: "I'm ready the next question!" },
];

export function GameDashboard({ session }) {
  const [progressState, setProgressState] = useState("login");
  const [gameState, setGameState] = useState(null);
  const [quizId, setQuizId] = useState("");
  const [currentGames, setCurrentGames] = useState([]);

  const socket = useSocket(session.id_token);
  const [msg, setMsg] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [timer, setTimer] = useState(60);
  const [peopleJoined, setPeopleJoined] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isCorrect, setIsCorrect] = useState(null);

  console.log("progressState-dashboard", progressState);
  console.log("questions", questions);
  console.log("index", currentQuestionIndex);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);
      console.log("message", message);

      if (message.type === "USER_CONNECTED") {
        setIsConnected(true);
      }

      if (message?.gameState) {
        setGameState(message.gameState);
        setQuizId(message.gameState[0]?.quizId);
        console.log("gameState", gameState);
      }

      if (message.type === "LIST_GAMES") {
        setCurrentGames(message.games);
      }

      setMsg((prev) => [...prev, message]);
    };

    return () => {
      socket.onmessage = null; // Clean up the previous handler
    };
  }, [socket]);

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    const correctOption =
      questions[currentQuestionIndex].options[
        questions[currentQuestionIndex].correctAnswer
      ];
    if (selectedOption === correctOption) {
      setScore((prevScore) => prevScore + 100);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setTimeout(() => {
      setSelectedOption("");
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setQuestionNumber((prevNumber) => prevNumber + 1);
      setTimer(60);
      setIsCorrect(null);
    }, 2000); // Wait for 2 seconds before moving to the next question
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { user: "You", message: chatInput }]);
      setChatInput("");
    }
  };

  const renderGameContent = () => {
    switch (progressState) {
      case "login":
        return renderLoginPage();

      case "game_info":
        return renderGameInfoPage();

      case "join_or_create":
        return renderJoinOrCreatePage();

      case "create":
        return renderGameCreatePage();

      case "join":
        return renderGameJoinPage();

      case "waiting":
        return renderWaitingPage();

      case "game_start":
        return renderDashboard();

      case "game_over":
        return renderLeaderboard();

      default:
        return renderLoginPage();
    }
  };

  const renderLoginPage = () => {
    return (
      <LandingPage session={session} setProgressState={setProgressState} />
    );
  };

  const renderGameInfoPage = () => {
    return <GameInfoComponent setProgressState={setProgressState} />;
  };

  const renderJoinOrCreatePage = () => {
    return (
      
      <>
        <Card className="w-full max-w-md overflow-hidden">
          <CardContent className="p-6 text-black">
            <div className="flex flex-col items-center justify-center space-y-6">
              <h1 className="text-3xl font-bold text-center mb-2">Join or Create a Game</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setProgressState("create")}
                >
                <Gamepad2 className="mr-2 h-5 w-5" />
                Create a Game
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setProgressState("join")}
                  >
                  <Users className="mr-2 h-5 w-5" />
                  Join a Game
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      
          
      </>
    );
  };

  const renderGameCreatePage = () => {
    return <GamePage socket={socket} setProgressState={setProgressState} />;
  };

  const renderGameJoinPage = () => {
    return (
      <>
        <RetroQuizList
          socket={socket}
          currentGames={currentGames}
          setProgressState={setProgressState}
        />
      </>
    );
  };

  const renderWaitingPage = () => {
    const start_game_message = {
      type: "START_GAME",
      quizName: "QUIZZZ",
      questions: questions.data,
    };
    const startGame = () => {
      socket.send();
      setProgressState("game_start");
    };
    return (
      <div className="h-full w-full  bg-gradient-to-br from-blue-900 via-black to-blue-900 p-8">
        <div className="container mx-auto bg-white bg-opacity-90 rounded-xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-minecraft mb-4 font-bold text-gray-800">CodeClash</h1>
            <div className="flex items-center gap-2 text-xl text-gray-800">
              <span className="font-minecraft mb-4">Quiz-id : {gameState[0]?.quizId}</span>
              <span className="font-minecraft mb-4">STATUS : {gameState[0]?.status}</span>
              <Users className="h-6 w-6 text-blue-500" />
              <span className="font-minecraft mb-4">{gameState[0]?.players.length} people joined</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Clock className="h-6 w-6 text-red-500" />
                  <span className="text-xl font-bold text-red-500">
                    waiting for players ...
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-full">
                <p className="flex items-center justify-center gap-2 text-xl font-semibold mb-2 w-full h-full">
                  <Button
                    className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => startGame()}
                  >
                    Start Game
                  </Button>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {gameState[0]?.players.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback>{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        {player?.score ?? 0}
                      </span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] mb-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-lg ${
                        index % 2 === 0 ? "bg-gray-100" : "bg-purple-100"
                      }`}
                    >
                      <span className="font-semibold text-purple-700">
                        {msg.user}:{" "}
                      </span>
                      <span>{msg.message}</span>
                    </div>
                  ))}
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    return (
      <div className="h-full w-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8">
        <div className="container mx-auto bg-white bg-opacity-90 rounded-xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">AI Quiz Game</h1>
            <div className="flex items-center gap-2 text-xl text-gray-800">
              <Users className="h-6 w-6 text-blue-500" />
              <span>{peopleJoined} people joined</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Clock className="h-6 w-6 text-red-500" />
                  <span className="text-xl font-bold text-red-500">
                    Time Left: {timer}s
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion && (
                  <>
                    <p className="text-xl font-semibold mb-2">
                      Question {questionNumber}
                    </p>
                    <p className="text-xl font-semibold mb-6 animate-pulse">
                      {currentQuestion.text}
                    </p>
                    <form
                      onSubmit={handleSubmitAnswer}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {currentQuestion.options &&
                        currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors 
                          ${
                            selectedOption === option
                              ? isCorrect === null
                                ? "bg-purple-300"
                                : isCorrect
                                ? "bg-green-300"
                                : "bg-red-300"
                              : "bg-purple-100"
                          } 
                          hover:bg-purple-200`}
                          >
                            <input
                              type="radio"
                              name="answer"
                              value={option}
                              checked={selectedOption === option}
                              onChange={(e) =>
                                setSelectedOption(e.target.value)
                              }
                              className="form-radio text-purple-500 hidden"
                            />
                            <span className="text-lg">{option}</span>
                          </label>
                        ))}
                      <Button
                        type="submit"
                        className="bg-purple-500 hover:bg-purple-600 mt-4 col-span-1 md:col-span-2"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Submit
                      </Button>
                    </form>
                  </>
                )}
                <p className="mt-6 text-2xl font-bold text-purple-600">
                  Your Score: {score}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {/* {gameState[0].leaderboard.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback>{player.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        {player.score}
                      </span>
                    </div>
                  ))} */}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] mb-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-2 p-2 rounded-lg ${
                        index % 2 === 0 ? "bg-gray-100" : "bg-purple-100"
                      }`}
                    >
                      <span className="font-semibold text-purple-700">
                        {msg.user}:{" "}
                      </span>
                      <span>{msg.message}</span>
                    </div>
                  ))}
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      {isConnected ? <div>Connected</div> : <div>Not connected</div>}
      {JSON.stringify(gameState)}
      {renderGameContent()}
    </>
  );
}
