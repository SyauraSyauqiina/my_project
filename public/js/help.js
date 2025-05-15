var me = {};
me.avatar = "image/profilcust.jpg"; //Profilfoto der Kunde

var you = {};
you.avatar = "image/profil.jpg"; //Profilfoto des Chatbots

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function insertChat(who, text, time) {
    if (time === undefined) {
        time = 0;
    }
    var control = "";
    var date = formatAMPM(new Date());

    if (who == "me") {
        control = '<li style="width:100%">' +
            '<div class="msj macro">' +
            '<div class="avatar"><img class="img-circle" style="width:100%;" src="' + me.avatar + '" /></div>' +
            '<div class="text text-l">' +
            '<p>' + text + '</p>' +
            '<p><small>' + date + '</small></p>' +
            '</div>' +
            '</div>' +
            '</li>';
    } else {
        control = '<li style="width:100%;">' +
            '<div class="msj-rta macro">' +
            '<div class="text text-r">' +
            '<p>' + text + '</p>' +
            '<p><small>' + date + '</small></p>' +
            '</div>' +
            '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="' + you.avatar + '" /></div>' +
            '</li>';
    }
    setTimeout(function() {
        $("#chat-ul").append(control).scrollTop($("#chat-ul").prop('scrollHeight'));
    }, time);
}

function resetChat() {
    $("#chat-ul").empty();
}

function sendMessage() {
    var text = $("#messageInput").val();
    if (text !== "") {
        insertChat("me", text);
        $("#messageInput").val('');

        setTimeout(() => {
            const botResponse = chatbot.generateResponse(text);
            console.log("Bot response: ", botResponse); // Debugging log
            insertChat("you", botResponse);
        }, 1000); 
    }
}

class Chatbot {
    constructor() {
        this.context = { recentMessages: [] };
        this.lastUserMessage = "";
        this.products = [
            { name: 'hose', prices: { default: 30, blaue: 32, schwarze: 35, braune: 45, rote: 45, weisse: 37} },
            { name: 'handtasche', prices: { default: 80, blaue: 85, schwarze: 90, braune: 82, rote: 80, weisse: 89} },
            { name: 'schuhe', prices: { default: 50, blaue: 52, schwarze: 55, braune: 59, rote: 65, weisse: 58} },
            { name: 'geldbeutel', prices: { default: 55, blauen: 57, schwarzen: 54, braunen: 60, roten: 51, weissen: 58} },
            { name: 'kleid', prices: { default: 25, blaues: 28, schwarzes: 30, braunes: 29, rotes: 26, weisses: 35} },
            { name: 'rock', prices: { default: 30, blauen: 32, schwarzen: 35, braunen: 45, roten: 45, weissen: 37} }
        ];
        this.loadResponses();
    }

    async loadResponses() {
        try {
            const response = await fetch('test.json');
            const data = await response.json();
            this.defaultResponses = data.defaultResponse;
            this.responses = data.responses;
            console.log("Responses loaded successfully"); // Debugging log
        } catch (error) {
            console.error("Error loading responses: ", error); // Error log
        }
    }

    greet() {
        this.context.greeted = true;
    }

    addressGiven() {
        this.context.addressReceived = true;
    }

    colorInStock() {
        this.context.colorHave = true;
    }

    angebot() {
        this.context.angebotFrage = true;
    }

    buyItem() {
        this.context.wantToBuy = true;
    }

    directBuy() {
        this.context.buyingDirectly = true;
    }

    itemResponse() {
        this.context.itemResponse = true;
    }

    orderNumberResponse() {
        this.context.expectingOrderNumber = true;
    }

    lieferDauert() {
        this.context.lieferTag = true;
    }
    damagedItemReceivedResponse() {
        this.context.damagedItemReceived = true;
    }

    reportDamage() {
        this.context.damageReported = true;
    }

    collectOrderNumber() {
        this.context.orderNumberProvided = true;
    }

    processRefund() {
        this.context.refundProcessed = true;
    }

    provideRefundTimeframe() {
        this.context.refundTimeframeProvided = true;
    }

    returnItem() {
        this.context.returnItemRequired = true;
    }

    handleOutOfStock() {
        this.context.outOfStockHandled = true;
    }

    offerReplacement() {
        this.context.replacementOffered = true;
    }

    processReplacement() {
        this.context.replacementProcessed = true;
    }

    closeConversation() {
        this.context.conversationClosed = true;
    }

    generateResponse(userMessage) {
        const userMessageCleaned = userMessage.toLowerCase().replace(/[^\w\s]/gi, '').trim();
        console.log("User message cleaned: ", userMessageCleaned); // Debugging log

        if (this.context.recentMessages.includes(userMessageCleaned)) {
            return "Sie haben das schon gesagt!";
        }

        let response = this.defaultResponses[Math.floor(Math.random() * this.defaultResponses.length)];
        
        const orderNumberPattern = /\b\d{9,}\b/;
        const orderNumberFound = userMessage.match(orderNumberPattern);

        const damagedItemNumberPattern = /\b\d{5,8}\b/;
        const damagedItemReceived = userMessage.match(damagedItemNumberPattern);

        if (damagedItemReceived) {
            response = "Vielen Dank! Wir haben die Nummer des Artikels  " + damagedItemReceived + " erhalten. Bitte geben Sie Ihre Adresse, damit wir den Ersatzartikel Ihnen geben können";
            this.damagedItemReceivedResponse();
        } else if (orderNumberFound) {
            response = "Vielen Dank! Ihre Bestellung wird verarbeitet. Innerhalb der 24 Stunde bekommen Sie eine E-Mail von uns. Wenn Sie noch Fragen zu stellen haben, können wir noch beantworten!";
            this.orderNumberResponse();
        } else {
            const productFound = this.products.find(product => userMessageCleaned.includes(product.name));
            if (productFound) {
                if (userMessageCleaned.includes('preis') || userMessageCleaned.includes('kost')) {
                    const colorMatch = Object.keys(productFound.prices).find(color => userMessageCleaned.includes(color));
                    const price = colorMatch ? productFound.prices[colorMatch] : productFound.prices.default;
                    response = `Der Preis für ${colorMatch ? colorMatch + ' ' : ''}${productFound.name} ist ${price} Euro. Möchten Sie noch weitere Informationen oder es direkt kaufen?`;
                } else {
                    response = `Wir haben ${productFound.name} auf Lager. Möchten Sie weitere Informationen oder es direkt kaufen?`;
                }
                this.itemResponse();
            } else {
                for (let i = 0; i < this.responses.length; i++) {
                    const { keywords, replies, action } = this.responses[i];
                    let allKeywordsMatch = true;

                    for (let j = 0; j < keywords.length; j++) {
                        if (!userMessageCleaned.includes(keywords[j])) {
                            allKeywordsMatch = false;
                            break;
                        }
                    }

                    if (allKeywordsMatch) {
                        response = replies[Math.floor(Math.random() * replies.length)];
                        if (this[action]) {
                            this[action]();
                        }
                        break;
                    }
                }
            }
        }

        this.updateContext(userMessageCleaned);

        this.lastUserMessage = userMessageCleaned;
        this.updateContext(userMessage, response);

        return response;
    }

    updateContext(userMessage, botResponse) {
        if (!this.context.history) {
            this.context.history = [];
        }

        this.context.history.push({
            userMessage: userMessage,
            botResponse: botResponse
        });

        this.context.recentMessages.push(userMessage);
        if (this.context.recentMessages.length > 10) {
            this.context.recentMessages.shift();
        }
    }

    getConversationHistory() {
        return this.context.history || [];
    }
}

const chatbot = new Chatbot();

$("#showHistoryButton").on("click", function() {
    console.log(chatbot.getConversationHistory());
});

$("#messageInput").on("keydown", function(e) {
    if (e.which == 13) {
        sendMessage();
    }
});

$("#sendButton").on("click", function() {
    sendMessage();
});

$(document).ready(function() {
    const welcomeMessage = "Willkommen zum unseren Chat! Wir haben viele Angebote in unserem Shop, Handtasche, Schuhe, Hose, Kleid, Rock und Geldbeutel. Sagen Sie mich gerne, wenn Sie Interesse darauf haben!";
    insertChat("you", welcomeMessage);
});
