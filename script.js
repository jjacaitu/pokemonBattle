
// Variable timer defined to store a tieSetOut to reload the page and alert the user in case of having a problem with the information of the api.

let timer;

// define the application object

pokemonApp = {};

// setting the initial status of the app
pokemonApp.init = () => {
   
    // set the click event for the reload click
    
    $(".reload").on("click",()=>{
        
        location.reload();
    })

    // Initializing properties of the game

    // Property to store the pokemons given to the player
    pokemonApp.playerPokemons = [];

    // Property to store the pokemons given to the CPU (pokemon master).
    pokemonApp.vsPokemons = []


    // Properties to store the amount of moves each pokemon has available. This is used to check later if the loop has checked all the moves to know when to start seleting the  random moves for th pokemon.

    pokemonApp.playerMovesToCheck = [];

    pokemonApp.vsMovesToCheck = [];

    // Property to store the index of the cpu active pokemon.

    pokemonApp.cpuActivePokemonIndex = undefined;

    // Property to store how effective a type is vs another type, used to calculate the damage of each move when used.

    pokemonApp.typesEffectiveness = {};

    // Property to track how many pokemons the player has left.
    pokemonApp.playerRemainingPokemon = 0;


    // Initialize and bind the click events for the start button, for the change pokemon button.
    pokemonApp.startClick;
    pokemonApp.choosePokemonClick;
    pokemonApp.choosePokemonButtonClick;

    

  console.log(pokemonApp.playerPokemons);

  console.log(pokemonApp.vsPokemons);

//   Call the method to get from the api the effectiveness of each type against the others and store them.

  pokemonApp.generateEffectivenessData();

  console.log(pokemonApp.typesEffectiveness);
}

// Async Method to get the information of a random pokemon from the api. The information includes name, stats, possible moves and images from front and back.

pokemonApp.getRandomPokemon = async function (pokemonGroup,movesToCheck,randomNumber,handicap){

    try{

        // create the properties of each pokemon, where selectedMoves will store the 4 random moves that will be available for the player or cpu and possible moves will be all the moves that eachpokemon could possibly have which will be used to select the 4 moves that will be available.

        pokemonGroup.push({
            stats: {},
            type: [],
            selectedMoves: [],
            possibleMoves: [],
            ready: false
        });
    
        movesToCheck.push(1);
        
        const pokemonIndex = pokemonGroup.length - 1;

        // The data is taken from the api and stores in the respective property or variable.
    
        const url = `https://pokeapi.co/api/v2/pokemon/${randomNumber}`;
    
        const pokemonData = await fetch(url);
    
        const pokemonDataRecieved = await pokemonData.json();
    
    
        const pokemonBeingAdded = pokemonGroup[pokemonIndex];
    
        pokemonBeingAdded.name = pokemonDataRecieved.name
    
        pokemonBeingAdded.id = pokemonDataRecieved.id
    
      
        pokemonBeingAdded.image_front = pokemonDataRecieved.sprites.front_default;
    
        pokemonBeingAdded.image_back = pokemonDataRecieved.sprites.back_default;
    

        pokemonDataRecieved.stats.forEach((stat)=>{
            pokemonBeingAdded.stats[stat.stat.name] = Math.ceil(stat.base_stat * handicap);
        })
    
    
        pokemonDataRecieved.types.forEach((type)=>{
            pokemonBeingAdded.type.push(type.type.name);
        });

        pokemonBeingAdded.stats.fullHp = pokemonBeingAdded.stats.hp;
    
        
    
        const moves = pokemonDataRecieved.moves;
    
    
    
        moves.forEach((move,index)=>{
            pokemonBeingAdded.possibleMoves.push({
                name: move.move.name,
                url : move.move.url,
                
            });

            // For each move we get additional information with another ajax call, to get the stats of the moves and type.
            
            pokemonApp.getPokemonMovesInfo(pokemonGroup,movesToCheck,move.move.url,pokemonIndex,index);

    
        });

        
    } catch(e){
        console.log(e);
    }

}

// After finding a problem ith the urls givven by the api this method was defined to clean the url getting rid of the last "/".

pokemonApp.takeOutLastSlashInUrl = (url) => {
     const splittedUrl = url.split("");
     splittedUrl.splice(splittedUrl.length - 1,1);
     const newUrl = splittedUrl.join("");

     return newUrl;
}

// Thi is the method used to get the aditional information of each move the pokemon can possibly have.

pokemonApp.getPokemonMovesInfo = async function (pokemonGroup,movesToCheck,url,pokemonIndex, index){

    try{

        const newUrl = pokemonApp.takeOutLastSlashInUrl(url);
        const moveData = await fetch(newUrl);

        const moveInformationRecieved = await moveData.json();


        const moveBeingAdded = pokemonGroup[pokemonIndex].possibleMoves;

        // We make sure to only attach aditional information to moves that make damage to the oponent to avoid getting moves like leer that would only affect stats.

        if(moveInformationRecieved.accuracy !== null && moveInformationRecieved.power !== null){
            moveBeingAdded[index].accuracy = moveInformationRecieved.accuracy;
            moveBeingAdded[index].power = moveInformationRecieved.power;
            moveBeingAdded[index].pp = moveInformationRecieved.pp;
            moveBeingAdded[index].priority = moveInformationRecieved.priority;
            moveBeingAdded[index].type = moveInformationRecieved.type.name;
            moveBeingAdded[index].class =  moveInformationRecieved.damage_class.name;
            movesToCheck[pokemonIndex] += 1;  
        } else {
            movesToCheck[pokemonIndex] += 1; 
        }
        // When the information of the last possible move has been recieved then we call the method to select 4 random moves of all the possible ones.

        if(movesToCheck[pokemonIndex] === moveBeingAdded.length){
            pokemonApp.getFourRandomMoves(pokemonGroup,pokemonIndex);
            pokemonGroup[pokemonIndex].ready = true;
            const numberOfPokemons = pokemonApp.length;

            // We check if both the cpu and the player has finished getting the moves for each of the pokemons available and the remove the loading and create the choose Pokemon div.

            if(pokemonApp.playerPokemons[numberOfPokemons - 1].ready && pokemonApp.vsPokemons[numberOfPokemons - 1].ready){
                setTimeout(() => {
                    clearTimeout(timer);
                    $(".loading").remove();
                    $(".choosePokemon .pokemonButton").remove();
                    pokemonApp.playerPokemons.forEach((pokemon,index)=>{
                        $(".choosePokemon .pokemonButtonsDiv").append(`<button class="pokemonButton active ${pokemon.name}_${index}" value="${index}"><img src="${pokemon.image_front}" alt="${pokemon.name}"></button>`);
                        $(".start").fadeOut();
                    })

                    // We check if there is a pokemon undefined in order to ask th player to reload the page.

                    if(pokemonApp.checkUndefined()){
                        alert("It seems all the pokemon are either recovering or in battle, please reload the page and try again!");
                        location.reload();
                    }

                    $(".gameBoard").fadeIn(); 
                }, 2000);
            }
               
        }
    } catch(e){
        console.log(e);
    }

}


// Method to get a random number.
pokemonApp.getRandomNumber = function (maxNumber){
    return Math.floor(Math.random() * maxNumber);
}


// Method to get 4 random moves from all the possible. 
pokemonApp.getFourRandomMoves = function (pokemonGroup,pokemonIndex){

    const moves_list = [];
    const possibleMoves = pokemonGroup[pokemonIndex].possibleMoves;
    const selectedMoves = pokemonGroup[pokemonIndex].selectedMoves;

    // First we make sure we are not getting moves that have no information avaliable by checking if the accuracy is undefined
    for(let i = 0; i < possibleMoves.length; i++){
        if(possibleMoves[i].accuracy !== undefined){
            moves_list.push(i);
        }
    }

    // To ty to avoid that the player recieves a pokemon with no moves like Ditto or magickarp we check if the moves available are less than 4 an if it is the case then we ask the player to reload the page.

    if(moves_list.length < 4 || possibleMoves.length < 4){
        alert("It seems all the pokemon are either recovering or in battle, please reload the page and try again!");
        location.reload();
        
        
    }else{
        for(let i=0; i< 4;i++){
        
            const randomMove = pokemonApp.getRandomNumber(moves_list.length);
            selectedMoves.push(possibleMoves[moves_list[randomMove]]);
            moves_list.splice(randomMove,1);   
        }
    
    }
    
}

// Method which bind the click event to the start button.

pokemonApp.startClick = $("form").on("submit",(event)=>{
    event.preventDefault();

    // We set a timer with 10 seconds in case for any reason the loading page never gets removed.

    timer = setTimeout(() => {
        alert("It seems all the pokemon are either recovering or in battle, please reload the page and try again!");
        location.reload();
    }, 10000);

    // We store the difficulty selection and the length of the game selected by the payer to generate the game.

    pokemonApp.difficulty = $(".difficulty_div input[type='radio']:checked").val();
    pokemonApp.length = $(".length_div input[type='radio']:checked").val();
    $(".intro").fadeOut();

    
    // Depending on the above the game is generated.

    for(i=0;i<pokemonApp.length;i++){
        pokemonApp.getRandomPokemon(pokemonApp.playerPokemons,pokemonApp.playerMovesToCheck,pokemonApp.getRandomNumber(600),1);
        pokemonApp.playerRemainingPokemon += 1;
   }

   for(i=0;i<pokemonApp.length;i++){
       pokemonApp.getRandomPokemon(pokemonApp.vsPokemons,pokemonApp.vsMovesToCheck,pokemonApp.getRandomNumber(600),pokemonApp.difficulty);
  }
    
});

// Method that binds and create the click event for each pokemon button. Disabling the event for the button referencing the active pokemon and generating the move buttons for the pokemon the player chose.

pokemonApp.choosePokemonClick = $(".choosePokemon").on("click",".pokemonButton",function(){
    $(".choosePokemon").fadeOut();

    
    // Conditional to check if it is not the first time choosing pokemon.
    if(pokemonApp.activePlayersPokemonIndex != undefined){
        
        const previousPokemon = pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex];

        $(`.${previousPokemon.name}_${pokemonApp.activePlayersPokemonIndex}`).removeAttr("disabled").addClass("active");
    }
   
    
    
    const pokemonChosen = pokemonApp.playerPokemons[$(this).val()];

    $(`.${pokemonChosen.name}_${$(this).val()}`).attr("disabled","true").removeClass("active");

    $(".moves").empty();

    // Creation of each move button depending on the selected pokemon.

    pokemonChosen.selectedMoves.forEach((move,index)=>{
        if(move.pp > 0){
            $(".moves").append(`<button class="moveButton moveButton_${move.name}" value="${index}"><p class="moveName">${move.name.toUpperCase()}</p><p>TYPE: ${move.type.toUpperCase()}<div><p class="pp"> PP:${move.pp}</p><p> POWER:${move.power}</p></div></button>`);
        }else{
            $(".moves").append(`<button class="disabledButton moveButton_${move.name}" value="${index}" disabled><p>${move.name.toUpperCase()}</p><p>TYPE: ${move.type.toUpperCase()}<div><p class="pp"> PP:${move.pp}</p><p> POWER:${move.power}</p></div></button>`);
        }
    
        // Binding of the click event for each move button.

        $(`.moveButton_${move.name}`).on("click",function()
        {   
            $(".moveButton").attr("disabled","true");
            $(".change").attr("disabled","true");

            const attackingPokemon = pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex];

            const moveUsed = move;
            
            const defendingPokemon = pokemonApp.vsPokemons[pokemonApp.cpuActivePokemonIndex];

            pokemonApp.attack(attackingPokemon,moveUsed,defendingPokemon);

        })
    });

    // Conditional to check if its the cpu already has chosen a pokemon or not. If it has not the it means that the battle is just starting

    if(pokemonApp.cpuActivePokemonIndex === undefined){
        
        // We create the health bar and information for each player
        pokemonApp.playerPokemons.forEach((pokemon, index)=>{
            $(".playersPokemonInfo .nameInfo").append(`<img class='pokeball_${index + 1}' src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' alt='pokeball'>`);
        })

        pokemonApp.vsPokemons.forEach((pokemon, index)=>{
            $(".cpusPokemonInfo .nameInfo").append(`<img class='pokeball_${index + 1}' src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' alt='pokeball'>`);
        })

        $(".playersPokemonInfo").fadeIn();

        $(".cpusPokemonInfo").fadeIn();

        // Gives the option to close the choose pokemon section the next time it opens making sure that the first timethe player have to select one.

        $(".cancel").fadeIn();

        $(".cancel").on("click",()=>{
            $(".choosePokemon").fadeOut();
        })
        
        $(".moveButton").attr("disabled","true");
        
        $(".other").append("<button class='change' disabled>Change Pokemon</button>");
        pokemonApp.changeCpuPokemon();
        // If not the in means that the player changed the pokemon in the middle of a battle which makes it possible for the cpu to attack.

    }else if(pokemonApp.activePlayersPokemonIndex !== undefined){
        setTimeout(() => {
            pokemonApp.cpuRandomAttack();
        }, 2000);
        
    }


    $(".playerBattlingPokemon").remove();

    pokemonApp.activePlayersPokemonIndex = $(this).val();
    pokemonApp.playerPokeballAnimation();

    setTimeout(() => {
        $(".playersPokemonInfo").before(`<img class="playerBattlingPokemon" src="${pokemonChosen.image_back}" alt="${pokemonChosen.name}">`);
    }, 1500);
     
    // The following updates the health bar of the pokemon and selects the color depending on the amount of health remaining.

    const remainingHpPorcentage = Math.ceil((pokemonChosen.stats.hp/pokemonChosen.stats.fullHp) * 100);

    if(remainingHpPorcentage >= 50){
        $(`.playersPokemonInfo .healthBar`).css("background",`linear-gradient(to right, green ${remainingHpPorcentage}% ,black 0%)`);

    }else if(remainingHpPorcentage > 25){
        $(`.playersPokemonInfo .healthBar`).css("background",`linear-gradient(to right, orange ${remainingHpPorcentage}% ,black 0%)`);

    }else{
        $(`.playersPokemonInfo .healthBar`).css("background",`linear-gradient(to right, red ${remainingHpPorcentage}% ,black 0%)`);

    }
 
    $(".playersPokemon .name").text(pokemonChosen.name.toUpperCase());
    

});


// Method that makes the cpu decides if it attacks or it changes the pokemon.
pokemonApp.cpuRandomAttack = () => {

    const cpuPokemon = pokemonApp.vsPokemons[pokemonApp.cpuActivePokemonIndex];

    const cpuPokemonMoves = cpuPokemon.selectedMoves;

    const randomNumber = pokemonApp.getRandomNumber(10);

    const defendingPokemon = pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex]; 

    // The cpu will only change the pokemon if the players health is higher than his, if it has more than one pokemon available and only in 1/10th of the times.

    if(cpuPokemon.stats.hp < defendingPokemon.stats.hp && randomNumber === 9 && pokemonApp.vsPokemons.length >1){
        pokemonApp.changeCpuPokemon(true);


    }else{
        

        const randomMoveIndex = pokemonApp.getRandomNumber(cpuPokemonMoves.length);

        const randomMove = cpuPokemonMoves[randomMoveIndex];

        pokemonApp.attack(cpuPokemon,randomMove,defendingPokemon,randomMoveIndex);
    }

    

}

// Binds and creates the cick event for the button that lets the player change of pokemon.

pokemonApp.choosePokemonButtonClick = $(".other").on("click",".change",()=>{
    $(".choosePokemon").fadeIn();
})

// Method that creates the messages that appear in each turn and move.

pokemonApp.makeAlert = (message) => {
    $(".alerts").fadeIn();
    $(".alerts p").text(message)
    setTimeout(() => {
        $(".alerts").fadeOut();
    }, 1000);
}

// Method that lets a pokemon attack aother pokemon. Inside the calculate damage method is called to calculate the damage based in stats, types and moves.

pokemonApp.attack = (attackingPokemon,move,defendingPokemon,moveIndex) => {

    // alert(`${attackingPokemon.name} just used ${move.name}`);
    pokemonApp.makeAlert(`${attackingPokemon.name.toUpperCase()} used ${move.name.toUpperCase()}`);

    const damageDone = pokemonApp.calculateDamage(attackingPokemon,move,defendingPokemon);

    // Here we define if the moves was effective or not.

    if(damageDone > 0) {
        if(defendingPokemon === pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex]){
            setTimeout(() => {
                $(".playerBattlingPokemon").addClass("hitted"); 
            }, 1000);
            
            $(".cpuBattlingPokemon").addClass("attacking");
        }else{
            setTimeout(() => {
                $(".cpuBattlingPokemon").addClass("hitted"); 
            }, 1000);
            
            $(".playerBattlingPokemon").addClass("attacking");
        }
    }

    let attackingDivClass = "";
    let defendingDivClass = "";

    if(attackingPokemon === pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex]){
        attackingDivClass = ".playersPokemonInfo";
        defendingDivClass = ".cpusPokemonInfo";
    }else{
        attackingDivClass = ".cpusPokemonInfo";
        defendingDivClass = ".playersPokemonInfo"
        setTimeout(() => {
            $(".moveButton").removeAttr("disabled");
            $(".change").removeAttr("disabled"); 
        }, 2000);
    }
    

    // The pp is checked in order to see if the move can be used. If it can be used the it affects the health of the pokemon and checks if the pokemon fainte or not. It also checks in the case the pokemon faited if the player or cpu have any other pokemon left to know if the battle has ended and declare a winner.

    if(move.pp !== 0 ){
        move.pp -= 1;
        defendingPokemon.stats.hp -= damageDone;
        
        if(defendingPokemon.stats.hp < 0 ){
            defendingPokemon.stats.hp = 0;
        }
        $(`${defendingDivClass} .health`).text(`HP: ${defendingPokemon.stats.hp}`);

        const remainingHpPorcentage = Math.ceil((defendingPokemon.stats.hp/defendingPokemon.stats.fullHp) * 100);

        setTimeout(() => {
            if(remainingHpPorcentage >= 50){
                $(`${defendingDivClass} .healthBar`).css("background",`linear-gradient(to right, green ${remainingHpPorcentage}% ,black 0%)`);
        
            }else if(remainingHpPorcentage > 25){
                $(`${defendingDivClass} .healthBar`).css("background",`linear-gradient(to right, orange ${remainingHpPorcentage}% ,black 0%)`);
    
            }else{
                $(`${defendingDivClass} .healthBar`).css("background",`linear-gradient(to right, red ${remainingHpPorcentage}% ,black 0%)`);
    
            }
        }, 2000);

       

        if(attackingDivClass === ".playersPokemonInfo"){
            $(`.moveButton_${move.name} .pp`).text(`PP: ${move.pp}`);
            if(defendingPokemon.stats.hp > 0){

                setTimeout(() => {
                    pokemonApp.cpuRandomAttack();  
                }, 4000);
                
                
            }else{
                setTimeout(() => {
                    $(".cpuBattlingPokemon").addClass("fainted");
                    pokemonApp.makeAlert(`${defendingPokemon.name.toUpperCase()} fainted..`);
                    pokemonApp.vsPokemons.splice(pokemonApp.cpuActivePokemonIndex,1);
                    setTimeout(() => {
                        pokemonApp.changeCpuPokemon();
                        $(`.cpusPokemonInfo .pokeball_${pokemonApp.vsPokemons.length + 1}`).css("opacity","0.5");
                    }, 2000);
                }, 3000);
                
                
            }
        }else{
            if(defendingPokemon.stats.hp === 0){
                
                $(`.${defendingPokemon.name}_${pokemonApp.activePlayersPokemonIndex}`).attr("disabled","true").removeClass("active").addClass("faint");
                setTimeout(() => {
                    $(".playerBattlingPokemon").addClass("fainted");
                    pokemonApp.makeAlert(`${defendingPokemon.name.toUpperCase()} fainted..`);
                }, 2000);
                
                setTimeout(() => {
                    
                    $(".playerBattlingPokemon").remove();
                    $('.moves').empty(); 
                }, 3000);
                
                
                delete pokemonApp.playerPokemons[pokemonApp.activePlayersPokemonIndex];
                pokemonApp.activePlayersPokemonIndex = undefined;
                pokemonApp.playerRemainingPokemon -= 1;
                $(`.playersPokemonInfo .pokeball_${pokemonApp.playerRemainingPokemon + 1}`).css("opacity","0.5");
                if(pokemonApp.playerRemainingPokemon === 0){
                    
                    setTimeout(() => {
                        $(".final_message").fadeIn(); 
                        $(".final_message p").text("You just ran out of pokemons... The pokemon master wins!");
                        $(".reload").text("TRY AGAIN");
                    }, 3000);
                    
                }else{
                    setTimeout(() => {
                        $(`.choosePokemon`).fadeIn();
                    }, 4000);
                   
                }
                
                


            }
        }

        if(move.pp === 0){
            $(`.moveButton_${move.name}`).attr("disabled","true").removeClass("moveButton").addClass("disabledButton");

            if(attackingDivClass === ".cpusPokemonInfo"){
                attackingPokemon.selectedMoves.splice(moveIndex,1);
            }
        }

        
   
    }
    setTimeout(() => {
        $(".hitted").removeClass("hitted");
        $(".attacking").removeClass("attacking")
        
    }, 2000);
    
    

}

// Method to calculate damage based on stats, types and effectiveness

pokemonApp.calculateDamage = (atackingPokemon,move,defendingPokemon) => {
    let defenseStat;
    let attackStat;
    if(move.class === "normal"){
        defenseStat = defendingPokemon.stats.defense;
        attackStat = atackingPokemon.stats.attack;
    }else{
        defenseStat = defendingPokemon.stats["special-defense"];
        attackStat = atackingPokemon.stats["special-attack"];
    }

    const power = move.power;

    const effective = pokemonApp.checkEffectiveness(move,defendingPokemon);

    return Math.ceil(((((2 * power * (attackStat/defenseStat))/50)+2))*effective);
}


// Method to check the effectivness of the move against the type of the defending pokemon.

pokemonApp.checkEffectiveness = (move,defendingPokemon)=>{
    const moveType = move.type;
    const defendingTypes = defendingPokemon.type;
    const moveTypeEffects = pokemonApp.typesEffectiveness[moveType];
    let effectivenessNumber = 1;

    defendingTypes.forEach((type)=>{
        const effect = moveTypeEffects[type];
        if( effect !== undefined && effect !== null){
            if(effect === "doubleDamage"){
                effectivenessNumber *= 2;
            }else if(effect === "halfDamage"){
                effectivenessNumber /= 2;
            }else{
                effectivenessNumber *= 0;
            }
        }

    })

    let message = "";

    if(effectivenessNumber >= 2){
        message = "It's supper effective!";
    }else if(effectivenessNumber === 0){
        message = `It has no effect on ${defendingPokemon.name.toUpperCase()}`;
    }else if(effectivenessNumber < 1){
        message = "It's not that effective!";
    }else{
        message = `It has a normal effect in ${defendingPokemon.name.toUpperCase()}`;
    }


    
    
    setTimeout(() => {
        pokemonApp.makeAlert(message); 
    }, 2000);
    
    

    return effectivenessNumber;
}


// Method that makes the fetch call in order to get the effectivness of each type of move or pokemon.

pokemonApp.generateEffectivenessData = async () => {
    const availableTypesUrl = "https://pokeapi.co/api/v2/type";

    const typePromise = await fetch(availableTypesUrl);
    const typesData = await typePromise.json();

    typesData.results.forEach((type)=>{

        pokemonApp.typesEffectiveness[type.name] = {};

        pokemonApp.getEffectivenessForType(type.url,type.name);



    })


}

pokemonApp.getEffectivenessForType = async (typeUrl,typeName) => {

    const typeEffectivenessPromise = await fetch(typeUrl);

    const typeEffectivenessData = await typeEffectivenessPromise.json();

    const doubleDamageArray = typeEffectivenessData.damage_relations.double_damage_to;
    const halfDamageArray = typeEffectivenessData.damage_relations.half_damage_to;
    const noDamageArray = typeEffectivenessData.damage_relations.no_damage_to;

    doubleDamageArray.forEach((type)=>{
        pokemonApp.typesEffectiveness[typeName][type.name] = "doubleDamage";
    })

    halfDamageArray.forEach((type)=>{
        pokemonApp.typesEffectiveness[typeName][type.name] = "halfDamage";
    })

    noDamageArray.forEach((type)=>{
        pokemonApp.typesEffectiveness[typeName][type.name] = "noDamage";
    })




}



// Method that lets the cpu change his battling pokemon for another one. This happens when the cpu decides to do it or in the case that the active pokemon has fainted.

pokemonApp.changeCpuPokemon = (inGame = false)=>{
    $(".cpuBattlingPokemon").remove();

    if(pokemonApp.vsPokemons.length === 0){
        // alert("The pokemon master ran out of pokemons! you win!");
        setTimeout(() => {
            $(".final_message p").text("The pokemon master ran out of pokemons! YOU WIN! You are the new Pokemon Master!");
            $(".reload").text("PLAY AGAIN");
            $(".final_message").fadeIn();
        }, 1000);
        
    }else{
        const previousPokemon = pokemonApp.cpuActivePokemonIndex;

        pokemonApp.cpuActivePokemonIndex = pokemonApp.getRandomNumber(pokemonApp.vsPokemons.length);

        if(previousPokemon === pokemonApp.cpuActivePokemonIndex){
            pokemonApp.cpuActivePokemonIndex = pokemonApp.getRandomNumber(pokemonApp.vsPokemons.length);
        }

        const cpuPokemon = pokemonApp.vsPokemons[pokemonApp.cpuActivePokemonIndex]; 

        
        // pokemonApp.makeAlert(`The pokemon master is sending ${cpuPokemon.name.toUpperCase()} out`);
        if(inGame === true){
            pokemonApp.makeAlert(`The pokemon master took ${pokemonApp.vsPokemons[previousPokemon].name.toUpperCase()} out of the battle...`);
        }

        setTimeout(() => {
            pokemonApp.cpuPokeballAnimation();
            pokemonApp.makeAlert(`The pokemon master is sending ${cpuPokemon.name.toUpperCase()} out`);

            setTimeout(() => {
                $(".computerPokemon").append(`<img class="cpuBattlingPokemon" src="${cpuPokemon.image_front}" alt"${cpuPokemon.name}">`);
                 
            }, 1500);
            
        }, 2000);

        

        const remainingHpPorcentage = Math.ceil((cpuPokemon.stats.hp/cpuPokemon.stats.fullHp)*100);

        if(remainingHpPorcentage >= 50){
            $(`.cpusPokemonInfo .healthBar`).css("background",`linear-gradient(to right, green ${remainingHpPorcentage}% ,black 0%`);
    
        }else if(remainingHpPorcentage > 25){
            $(`.cpusPokemonInfo .healthBar`).css("background",`linear-gradient(to right, orange ${remainingHpPorcentage}% ,black 0%`);
    
        }else{
            $(`.cpusPokemonInfo .healthBar`).css("background",`linear-gradient(to right, red ${remainingHpPorcentage}% ,black 0%`);
    
        }

        

        $(".computerPokemon .name").text(cpuPokemon.name.toUpperCase());

        setTimeout(() => {
            $(".moveButton").removeAttr("disabled"); 
            $(".change").removeAttr("disabled");
        }, 3000);

       
    }

    
}


// Method that makes the animation of the player calling a new pokemon happen.

pokemonApp.playerPokeballAnimation = () => {
    $(".playersPokemon").append(`<img class="playerPokeballAnimation"src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png">`);

    setTimeout(() => {
        $(".activePokemon").addClass("lightning");
        setTimeout(() => {
            $(".lightning").removeClass("lightning");
        }, 1500);
    }, 1000);

    setTimeout(() => {
        $(".playerPokeballAnimation").remove();
    }, 1000);

    

}

// Method to check if there is a pokemon undefined after the fetch calls

pokemonApp.checkUndefined = () => {
    pokemonApp.vsPokemons.forEach((pokemon)=>{
        if(pokemon.name === undefined){
            return true;
        }
    });
    pokemonApp.playerPokemons.forEach((pokemon)=>{
        if(pokemon.name === undefined){
            return true;
        }
    })
}


// Method that makes the animation of the cpu calling a new pokemon happen.

pokemonApp.cpuPokeballAnimation = () => {
    $(".computerPokemon").append(`<img class="cpuPokeballAnimation" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png">`);

    setTimeout(() => {
        $(".activePokemon").addClass("lightning");
        setTimeout(() => {
            $(".lightning").removeClass("lightning");
        }, 1500);
    }, 1000);

    setTimeout(() => {
        $(".cpuPokeballAnimation").remove();
    }, 1000);
}

$(function(){
    pokemonApp.init();
})

    

  