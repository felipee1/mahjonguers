### Mahjonguers

A browser-based app for managing your Mahjong games with an integrated deep learning model.

---

### About the Project

Mahjonguers is a simple and elegant tool for Mahjong enthusiasts. It helps you keep track of your games, and with the power of a deep learning model, it can offer insights into your plays and potential winning hands.

The highlight of this project is the **deep learning model that runs directly in your browser**. This means all the processing is done locally, ensuring your data is private and the app works even offline.

Whether you're a casual player looking to record your victories or a serious competitor wanting to analyze your strategies, Mahjonguers is for you.

---

### Features

-   **Game Management:** Easily log and save details of your Mahjong matches, including players, scores, and winning hands.
-   **In-Browser Deep Learning:** A trained model uses your game data to analyze hand patterns and provide real-time suggestions and statistics.
-   **No Server Required:** All functionality, including the deep learning model, is self-contained within the browser. There's no backend, so your data never leaves your device.
-   **Intuitive Interface:** A clean and straightforward design makes it easy to input game data and visualize your progress.
-   **Scalable:** The model can be trained on your own data over time, becoming more personalized and accurate the more you play.

---

### How to Use

1.  **Launch the App:** Simply run npm run dev and open you localhost:8090 in your web browser or access [githubpages](https://felipee1.github.io/mahjonguers).
2.  **Start a Game:** Input the names of the players and the Mahjong variant you are playing.
3.  **Record Your Hands:** As you play, enter the tiles of the winning hand and the final scores.
4.  **Get Insights:** The model will analyze the hand and provide feedback, such as potential `yaku` or `fan` combinations, helping you understand the value of your hand.
5.  **Review and Analyze:** The app keeps a history of your games, allowing you to review past performance and identify trends in your play.

---

### Technologies Used

-   **React:** Used for building the user interface with a component-based architecture.
-   **Tailwind CSS:** For fast and efficient styling of the app's modern and responsive design.
-   **ONNX Runtime Web:** Powers the deep learning model, enabling it to run directly in the browser with high performance.
-   **Mahjong Rules Library:** A custom library to handle the complexities of Mahjong scoring and different rule sets.

---

### Contribution

Mahjonguers is an open project. Contributions are welcome! Feel free to open an issue, send me a message or submit a pull request if you have ideas for new features, bug fixes, or improvements.