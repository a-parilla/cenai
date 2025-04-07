document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Updated linkify function to handle parentheses and formatting
function linkify(text) {
    // Handle line breaks, lists, and URLs
    text = text.replace(/\n/g, '<br>'); // Line breaks
    text = text.replace(/(\d+\.)\s/g, '<br>$1 '); // Numbered lists
    text = text.replace(/•\s/g, '<br>• ').replace(/\*\s/g, '<br>* '); // Bullet points
    
    // URL detection with improved regex
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    text = text.replace(urlRegex, (url) => {
        const cleanUrl = url.replace(/[.,;:)]$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`;
    });

    // Remove initial <br> if it exists
    return text.replace(/^<br>/, '');
}

async function sendMessage() {
    const userInput = document.getElementById('userInput').value.trim();
    if (!userInput) return;

    const messagesDiv = document.getElementById('chat-container');
    const button = document.querySelector('button');
    const input = document.getElementById('userInput');

    // Display user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerText = userInput;
    messagesDiv.appendChild(userMessageDiv);

    // Clear input and disable controls
    input.value = '';
    input.disabled = true;
    button.disabled = true;
    button.innerText = 'Thinking...';

    // Add loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'loading-message');
    loadingDiv.innerHTML = 'Assistant is typing<span class="typing-indicator"></span>';
    messagesDiv.appendChild(loadingDiv);

    try {
        const response = await fetch('//cenai.cse.uconn.edu/index/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
		'Accept': 'text/event-stream'
            },
            body: JSON.stringify({ message: userInput })
        });

	const reader = response.body.getReader();
	const decoder = new TextDecoder();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


	const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        messagesDiv.appendChild(botMessageDiv);
	botMessageDiv.innerHTML = "<p></p>";
	// Remove loading message
        loadingDiv.remove();

	var fullText = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) { return; }
		const text = decoder.decode(value, {stream: true});
		console.log(text);
		fullText += text;
		botMessageDiv.innerHTML = markdown(fullText);
	}
	
	/*
        const data = await response.json();

                if (data.error) {
            throw new Error(data.error);
        }

        // Display bot response with clickable links
        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('message', 'bot-message');
        botMessageDiv.innerHTML = linkify(data.response);
        messagesDiv.appendChild(botMessageDiv);
	*/

    } catch (error) {
        // Use handleError function for error messages
        window.chatUtils.handleError(error, messagesDiv);
    } finally {
        // Re-enable controls
        input.disabled = false;
        button.disabled = false;
        button.innerText = 'Send';
        input.focus();
        
        // Auto-scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const centerMessage = document.getElementById('center-message');
        centerMessage.classList.add('blink-out');
    }
});


// Expose linkify and handleError as utilities for consistency
window.chatUtils = {
    formatMessage: linkify,
    handleError: (error, messagesDiv) => {
        console.error('Error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('message', 'error-message');
        errorDiv.innerText = error.message || 'Sorry, something went wrong. Please try again.';
        messagesDiv.appendChild(errorDiv);
    }
};

function markdown(src) {

    var rx_lt = /</g;
    var rx_gt = />/g;
    var rx_space = /\t|\r|\uf8ff/g;
    var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g;
    var rx_hr = /^([*\-=_] *){3,}$/gm;
    var rx_blockquote = /\n *&gt; *([^]*?)(?=(\n|$){2})/g;
    var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g;
    var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g;
    var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g;
    var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g;
    var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g;
    var rx_table = /\n(( *\|.*?\| *\n)+)/g;
    var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/;
    var rx_row = /.*\n/g;
    var rx_cell = /\||(.*?[^\\])\|/g;
    var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g;
    var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g;
    var rx_stash = /-\d+\uf8ff/g;

    function replace(rex, fn) {
        src = src.replace(rex, fn);
    }

    function element(tag, content) {
        return '<' + tag + '>' + content + '</' + tag + '>';
    }

    function blockquote(src) {
        return src.replace(rx_blockquote, function(all, content) {
            return element('blockquote', blockquote(highlight(content.replace(/^ *&gt; */gm, ''))));
        });
    }

    function list(src) {
        return src.replace(rx_list, function(all, ind, ol, num, low, content) {
            var entry = element('li', highlight(content.split(
                RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')));

            return '\n' + (ol
                ? '<ol start="' + (num
                    ? ol + '">'
                    : parseInt(ol,36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
                : element('ul', entry));
        });
    }

    function highlight(src) {
        return src.replace(rx_highlight, function(all, _, p1, emp, sub, sup, small, big, p2, content) {
            return _ + element(
                  emp ? (p2 ? 'strong' : 'em')
                : sub ? (p2 ? 's' : 'sub')
                : sup ? 'sup'
                : small ? 'small'
                : big ? 'big'
                : 'code',
                highlight(content));
        });
    }

    function unesc(str) {
        return str.replace(rx_escape, '$1');
    }

    var stash = [];
    var si = 0;

    src = '\n' + src + '\n';

    replace(rx_lt, '&lt;');
    replace(rx_gt, '&gt;');
    replace(rx_space, '  ');

    // blockquote
    src = blockquote(src);

    // horizontal rule
    replace(rx_hr, '<hr/>');

    // list
    src = list(src);
    replace(rx_listjoin, '');

    // code
    replace(rx_code, function(all, p1, p2, p3, p4) {
        stash[--si] = element('pre', element('code', p3||p4.replace(/^    /gm, '')));
        return si + '\uf8ff';
    });

    // link or image
    replace(rx_link, function(all, p1, p2, p3, p4, p5, p6) {
        stash[--si] = p4
            ? p2
                ? '<img src="' + p4 + '" alt="' + p3 + '"/>'
                : '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
            : p6;
        return si + '\uf8ff';
    });

    // table
    replace(rx_table, function(all, table) {
        var sep = table.match(rx_thead)[1];
        return '\n' + element('table',
            table.replace(rx_row, function(row, ri) {
                return row == sep ? '' : element('tr', row.replace(rx_cell, function(all, cell, ci) {
                    return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : ''
                }))
            })
        )
    });

    // heading
    replace(rx_heading, function(all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))) });

    // paragraph
    replace(rx_para, function(all, content) { return element('p', unesc(highlight(content))) });

    // stash
    replace(rx_stash, function(all) { return stash[parseInt(all)] });

    return src.trim();
}
