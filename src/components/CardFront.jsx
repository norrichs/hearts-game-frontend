import React from 'react'


const CardFront = ({cardValue, handleSelectCard}) => {
	const valueText = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
	const suits = {
		c: String.fromCharCode(0x2663),
		s: String.fromCharCode(0x2660),
		d: String.fromCharCode(0x2666),
		h: String.fromCharCode(0x2665)
	}
	const suit  = cardValue[0]
	const value = parseInt(cardValue.substr(1))
	const [isSelected, setIsSelected] = React.useState(false)
	const [symbols, setSymbols] = React.useState([])
	
	const symbolArray = () => {

		const symbolArray =  new Array(value)
		symbolArray.fill(suits[suit])
		return symbolArray

	}




	React.useEffect(()=>{
		setSymbols([...symbolArray()])
	},[])
	

	return(
		<div 
			className={`card-front suit-${suit}`}
			onClick={()=>{handleSelectCard(cardValue)}}
		>
			
			<div className='value'><div>{value}</div><div>{suits[suit]}</div></div>
			<div className='symbol-wrapper'>
				<div className={`symbol-display ${value < 11 ? 'numeric' : 'nominal'}`}>
					<div className='symbol sym-b1'>{symbols[0]}</div>
					<div className='symbol sym-b2'>{symbols[1]}</div>
					<div className='symbol sym-s1'>{symbols[2]}</div>
					<div className='symbol sym-s2'>{symbols[3]}</div>
					<div className='symbol sym-s3'>{symbols[4]}</div>
					<div className='symbol sym-s4'>{symbols[5]}</div>
					<div className='symbol sym-s5'>{symbols[6]}</div>
					<div className='symbol sym-s6'>{symbols[7]}</div>
					<div className='symbol sym-s7'>{symbols[8]}</div>
					<div className='symbol sym-s8'>{symbols[9]}</div>
				</div>
			</div>
			<div className='value'><div>{value}</div><div>{suits[suit]}</div></div>
			




		</div>
	)
}
export default CardFront