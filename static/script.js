document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerini seç
    const textInput = document.getElementById('text-input');
    const keyInput = document.getElementById('key-input');
    const encryptBtn = document.getElementById('encrypt-btn');
    const decryptBtn = document.getElementById('decrypt-btn');
    const resultOutput = document.getElementById('result-output');
    const copyBtn = document.getElementById('copy-btn');
    const errorMessageDiv = document.getElementById('error-message');
    const placeholder = document.querySelector('.placeholder');

    // Sonuç kutusundaki yer tutucu metni yöneten fonksiyon
    const updateResultBox = (content) => {
        if (content) {
            if (placeholder) placeholder.style.display = 'none';
            resultOutput.textContent = content;
            copyBtn.disabled = false;
        } else {
            if (placeholder) placeholder.style.display = 'inline';
            resultOutput.textContent = '';
            copyBtn.disabled = true;
        }
    };

    // Hata mesajlarını gösteren fonksiyon
    const displayError = (message) => {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    };

    // Hata mesajlarını temizleyen fonksiyon
    const clearError = () => {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    };

    // Arka uç API'sini çağıran ana fonksiyon
    const performCipher = async (mode) => {
        clearError();
        const text = textInput.value;
        const key = keyInput.value;

        if (!text || !key) {
            displayError('Lütfen hem metin hem de anahtar alanlarını doldurun.');
            return;
        }

        try {
            // Sunucuya istek gönder
            const response = await fetch('/cipher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, key, mode })
            });
            
            const data = await response.json();

            if (response.ok) {
                updateResultBox(data.result);
            } else {
                displayError(data.error || 'Bilinmeyen bir hata oluştu.');
                updateResultBox(''); // Hata durumunda sonucu temizle
            }
        } catch (error) {
            console.error('API isteği başarısız:', error);
            displayError('Sunucuya bağlanırken bir hata oluştu.');
            updateResultBox('');
        }
    };

    // Butonlar için olay dinleyicileri
    encryptBtn.addEventListener('click', () => performCipher('encrypt'));
    decryptBtn.addEventListener('click', () => performCipher('decrypt'));

    // Kopyala butonu için olay dinleyicisi
    copyBtn.addEventListener('click', () => {
        const textToCopy = resultOutput.textContent;
        if (textToCopy && !copyBtn.disabled) {
            // Panoya yazma işlemi
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.textContent = 'Kopyalandı!';
                setTimeout(() => {
                    copyBtn.textContent = 'Kopyala';
                }, 2000);
            }).catch(err => {
                console.error('Kopyalama başarısız:', err);
                displayError('Metin kopyalanamadı.');
            });
        }
    });

    // Sayfa ilk yüklendiğindeki durum
    updateResultBox('');
});
