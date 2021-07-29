import React from 'react'


const CardFront = ({cardValue, handleDoubleClickCard}) => {
	const valueText = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
	const suit  = cardValue[0]
	const value = parseInt(cardValue.substr(1))
	const [isSelected, setIsSelected] = React.useState(false)
	

	

	return(
		<div 
			className={`card-container card-front suit-${suit} ${isSelected?'selected':'unselected'}`}
			onClick={()=>{setIsSelected( isSelected ? false : true)}}
			onDoubleClick={handleDoubleClickCard}
		>
			<h2>{value}</h2>
			<h2>{suit}</h2>
		</div>
	)
}
export default CardFront