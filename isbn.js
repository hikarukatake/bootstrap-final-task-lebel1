// ~~~~~~~~~ISBNコードで取得できているか確認~~~~~~~~~~~
        //  ～これはサーチボタンを非同期で進めるクリックしたらisbnコードを
        // document.getElementById('searchBtn').addEventListener('click', async () => {
        //     const isbn = document.getElementById('isbn-input').value;
        //     console.log("isbnコード:", isbn);

        //     try {
        //  ～isbnコードを用いて接続している国立国会図書館apiに～
        //         const response = await fetch(`https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${isbn}`);
        //  ～response.text();は図書館から返ってきたデータを、プログラムで読める文字に変換します。 ～
        //         const text = await response.text();
        //  ～国立国会図書館からはxml方式で届くので
        //  ～DOMParser().parseFromStringは届いた文字をxmlという形式だと認識させる
        //         const xml = new DOMParser().parseFromString(text, "text/xml");
        //  ～xml.querySelectorは送られたデータから本に当たる<item>を探している
        //         const item = xml.querySelector("item");

        //  ～もしアイテムの情報が見つかったらtitleを表示する.textContentでtitleだけを抽出する
        //         if (item) {
        //             console.log("データ取得成功:", item.querySelector("title").textContent);
        //         } else {
        //             console.log("本が見つかりませんでした");
        //         }
        //     } catch (e) {
        //         console.error("通信エラー:", e);
        //     }
        // });

        // 1.========== 共通の検索関数（国立国会図書館API) ==========
        // この関数を作ることで、ボタンからもスキャナーからも呼べるようになります
        async function fetchBookInfo(isbn) {
            // ISBNが入力されてなければ何もしない
            if (!isbn) return;
            
            // console.log("検索開始 ISBN:", isbn);
            // 検索結果を表示する
            const resultSection = document.getElementById('search-result-section');
            // isbn表示エラー用
            const isbnError = document.getElementById('isbnError');

            try {
                // 国立国会図書館APIへの接続
                const response = await fetch(`https://ndlsearch.ndl.go.jp/api/opensearch?isbn=${isbn}`);
                // XML形式のデータを文字列として受けとる(APIから帰ってきてる値が文字列なのでそれを格納している)
                const text = await response.text();
                // 文字列のままだと中身が探せないので
                // XMLのパース処理(文字列をXMLに置き換える)
                // XML文字列を DOMとして解析する(HTMLと同じ感じに変えている)
                const xml = new DOMParser().parseFromString(text, "text/xml");
                // 検索結果一件目を取得(Itemを探せる)
                const item = xml.querySelector("item");
                // 本が見つかったときの処理
                if (item) {
                    // 初回検索されて✖を押して非表示にされたときにその次がそのまま非表示になってるからそれを直している
                    resultSection.classList.remove('d-none');
                    // 前回エラーが表示されている可能性があるのでその場合の非表示処理
                    if (isbnError) isbnError.classList.add('d-none');
                    // 本のタイトルを取得
                    const title = item.querySelector("title").textContent;
                    // 著者が複数タグある場合などを考慮して取得
                    // creatorこれは著者を指している
                    // <dc:creator>山田 太郎</dc:creator>XMLに直した形にはこういう感じでいる
                    // [0]は最初の一個だけ
                    const authorElem = item.getElementsByTagName("dc:creator")[0] || item.getElementsByTagName("author")[0];
                    let author = authorElem ? authorElem.textContent : "著者不明";
                    // 著作者の後ろにある出版年を削除、カンマをスペースに変換
                    // 実際は(苗字,name,2020)みたいになっている
                    // replaceは,をスペースに変換している
                    // \s*→空白, \d{4}→数字の4桁, -?→ハイフンが0回でも1回でも,$→行末
                    author = author.replace(/,\s*\d{4}-?$/, '').replace(',', ' ');

                    // 出版社（保存用）
                    // getElementsByTagName("dc:publisher")[0]これは<dc:publisher>タグを探して一番目をとっているitemは一冊のデータを全部取っていてその中の
                    const pubElem = item.getElementsByTagName("dc:publisher")[0];
                    const publisher = pubElem ? pubElem.textContent : "";

                    console.log("データ取得成功:", title);

                    // 画面への表示
                    document.getElementById('result-title').textContent = title;
                    document.getElementById('result-author').textContent = author;
                    // ※NDLの書影APIを使用
                    document.getElementById('result-cover').src = `https://ndlsearch.ndl.go.jp/thumbnail/${isbn}.jpg`;

                    // 出版社を保存ボタン用に一時保存（画面には出さない場合）
                    document.getElementById('result-title').dataset.publisher = publisher;

                } else {
                    console.log("本が見つかりませんでした");
                    if (isbnError) isbnError.classList.remove('d-none');
                    resultSection.classList.add('d-none');
                }
            } catch (e) {
                console.error("検索エラーまたは通信エラー:", e);
                alert("検索中にエラーが発生しました。");
            }
        }


        // ========= 2. 検索ボタンのクリックイベント ==========
        // searchBtnがクリックされたらid="isbn-input"の数字の値を取得して
        // fetchBookInfo関数を呼び出す
        document.getElementById('searchBtn').addEventListener('click', () => {
            // trimで前後の空白を削除
            // valueで入力された値を取り出している
            const isbn = document.getElementById('isbn-input').value.trim();
            fetchBookInfo(isbn); // 上で作った共通関数を呼ぶ
        });


        // ======= 3. スキャナー(Quagga)関連の処理  =========
        let myModal = null;

        // スキャナー起動するための関数
        function startScanner() {
            // ID scannermodalのidの情報を取得
            const modalElem = document.getElementById('scannermodal');
            // MyModalがまだ未定義ならBootstrapのモーダルを生成
            if (!myModal) {
                myModal = new bootstrap.Modal(modalElem);
            }
            // さっき作ったモーダルの表示
            myModal.show();

            modalElem.addEventListener('shown.bs.modal', function () {
                // バーコードスキャナーの開始
                Quagga.init({

                    inputStream: {
                        // リアルタイムにカメラの入力
                        name: "Live",
                        type: "LiveStream",
                        // カメラ映像を表示するDOM
                        target: document.querySelector('#scanner-viewport'),
                        // 背面カメラを使う
                        constraints: {
                            facingMode: "environment"
                        },
                    },
                    // 画像を分析するエリア設定
                    patchSize: "medium",
                    // 画面のどこにバーコードがあるか探す
                    locate: true,
                    // 値が下がると軽くなるがスキャンするまで時間がかかる
                    frequency: 10, //1秒間のスキャン回数）
                    // 画像を半分にして処理するから高速化している
                    halfSample: true, // ★ここを追加：画像を小さくして処理を高速化
                    decoder: {
                        // ISBNコードとJANコードをとるよってこと
                        readers: ["ean_reader"],
                        // 一度に一つのバーコードだけを読む
                        multiple: false
                    },
                    // カメラが許可されていない場合
                }, function (err) {
                    if (err) {
                        console.error(err);
                        alert("カメラの起動に失敗しました。");
                        return;
                    }
                    // iOS等でのCanvasエラー対策
                    const canvas = document.querySelector('#scanner-viewport canvas');
                    // これがないと画面がマックラ
                    if (canvas) {
                        canvas.getContext('2d', { willReadFrequently: true });
                    }
                    // スキャンの開始
                    Quagga.start();
                });
                // これは一回だけ実行するようにしている
                // モーダルは同じなので初期化をする必要ないので一回だけ実行
            }, { once: true });
        }

        // スキャナー停止
        function stopScanner() {
            // Quaggaが定義されている場合を確認して停止
            if (typeof Quagga !== 'undefined') { Quagga.stop(); }
            // モーダルが定義されているなら閉じる
            if (myModal) { myModal.hide(); }
        }

        // スキャン検出時の処理
        Quagga.onDetected(function (result) {
            const code = result.codeResult.code;

            // ISBN コードが13桁で、978または979で始まる場合に処理
            if (code.length === 13 && (code.startsWith('978') || code.startsWith('979'))) {

                // codeが上で書いてるようにバーコードで取得したisbnコーdお
                document.getElementById("isbn-input").value = code;

                // スキャナーを止めて閉じる
                stopScanner();

                // バーコードから取得した場合の処理
                fetchBookInfo(code);
            }
        });


        //  ======== 4. 結果のクリアや保存ボタンなどその他の処理 ~=========

        function clearSearchResult() {
            // 検索結果のクリア
            document.getElementById('search-result-section').classList.add('d-none');
            // ISBN入力欄をクリア
            document.getElementById('isbn-input').value = '';
            // 検索結果の各フィールドをクリア
            const isbnError = document.getElementById('isbnError');
            if (isbnError) isbnError.classList.add('d-none');

            // 追加のUI要素があればクリア
            const option = document.getElementById('searchResultOption');
            const select = document.getElementById('mangaSelect');
            if (option) option.classList.add('d-none');
            if (select) select.value = '';
        }

        // これはマイリストに追加を押したときに次のモーダルでタイトルと著者を自動でセットするための処理
        const nextBtn = document.getElementById("btn-next-step");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                // タイトルと著者をDOMから取得できるようにしている
                const title = document.getElementById("result-title").textContent;
                const author = document.getElementById("result-author").textContent;

                 // モーダルのinputにセット
                document.getElementById("modal-title").value = title;
                document.getElementById("modal-author").value = author;

                // モーダルで表示はしないがデータは送る要素たち
                // datasetpublisherで出版社情報を取得
                const publisher = document.getElementById("result-title").dataset.publisher || "出版社不明";
                // 表示画像URL
                const cover = document.getElementById("result-cover").src;
                const isbn = document.getElementById("isbn-input").value.trim();
                // ローカルストレージに登録
                localStorage.setItem("book_title", title);
                localStorage.setItem("book_author", author);
                localStorage.setItem("book_publisher", publisher);
                localStorage.setItem("book_cover", cover);
                localStorage.setItem("book_isbn", isbn);
            });
        }