        document.addEventListener('DOMContentLoaded', function () {
            const form = document.getElementById('postForm');
            const submitBtn = document.getElementById('submitBtn');

            const mangaSelect = document.getElementById('mangaSelect');
            const postTitle = document.getElementById('postTitle');
            const categorySelect = document.getElementById('categorySelect');
            const postContent = document.getElementById('postContent');

            function validate() {
                let valid = true;

                // 作品選択
                if (!mangaSelect.value) {
                    document.getElementById('mangaError').classList.remove('d-none');
                    valid = false;
                } else {
                    document.getElementById('mangaError').classList.add('d-none');
                }

                // タイトル（30文字以内）
                if (!postTitle.value.trim() || postTitle.value.length > 30) {
                    document.getElementById('titleError').classList.remove('d-none');
                    valid = false;
                } else {
                    document.getElementById('titleError').classList.add('d-none');
                }

                // カテゴリ
                if (!categorySelect.value) {
                    document.getElementById('categoryError').classList.remove('d-none');
                    valid = false;
                } else {
                    document.getElementById('categoryError').classList.add('d-none');
                }

                // 本文（500文字以内）
                if (!postContent.value.trim() || postContent.value.length > 500) {
                    document.getElementById('contentError').classList.remove('d-none');
                    valid = false;
                } else {
                    document.getElementById('contentError').classList.add('d-none');
                }

                // ボタン制御
                submitBtn.disabled = !valid;
            }

            // 入力イベント監視
            [mangaSelect, postTitle, categorySelect, postContent].forEach(field => {
                field.addEventListener('input', validate);
                field.addEventListener('change', validate);
            });

            // 初期チェック
            validate();

            // フォーム送信時のトースト表示
            document.getElementById('postForm').addEventListener('submit', function (e) {
                e.preventDefault();
                var toast = new bootstrap.Toast(document.getElementById('successToast'));
                toast.show();
                this.reset();
            });

            // プレビュー生成
            previewBtn.addEventListener("click", function () {
                const mangaSelect = document.getElementById("mangaSelect");
                document.getElementById("previewmanga").textContent =
                    mangaSelect.options[mangaSelect.selectedIndex].text;

                document.getElementById("previewTitle").textContent =
                    document.getElementById("postTitle").value;

                const categorySelect = document.getElementById("categorySelect");
                const categoryValue = categorySelect.value;
                const categoryText = categorySelect.options[categorySelect.selectedIndex].text;

                document.getElementById("previewContent").textContent =
                    document.getElementById("postContent").value;

                const spoilerCheck = document.getElementById("spoilerCheck").checked;
                document.getElementById("previewSpoiler").classList.toggle("d-none", !spoilerCheck);

                const rawTags = document.getElementById("tagInput").value;
                const tagContainer = document.getElementById("previewTags");
                tagContainer.innerHTML = "";
                if (rawTags.trim() !== "") {
                    rawTags.split(",")
                        .map(tag => tag.trim())
                        .filter(tag => tag !== "")
                        .forEach(tag => {
                            const span = document.createElement("span");
                            span.className = "badge bg-info me-1";
                            span.textContent = "#" + tag;
                            tagContainer.appendChild(span);
                        });
                }
                // カテゴリバッジ
                const categoryColors = {
                    impression: "bg-primary",
                    theory: "bg-warning text-dark",
                    question: "bg-success",
                    discussion: "bg-secondary",
                    fanart: "bg-dark"
                };
                const categoryContainer = document.getElementById("previewCategory");
                categoryContainer.innerHTML = "";
                if (categoryValue) {
                    const span = document.createElement("span");
                    span.className = `badge ${categoryColors[categoryValue]}`;
                    span.textContent = categoryText;
                    categoryContainer.appendChild(span);
                }
            });
        });