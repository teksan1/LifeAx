import React from 'react';
type Props = { children?: React.ReactNode, onClick?: ()=>void, value?: string, checked?: boolean, onChange?: (v:any)=>void };
export const Card: React.FC<Props> = ({children,onClick,value,checked,onChange}) => {
  switch('Card'){
    case 'Button': return <button style={{padding:'0.3em 0.6em',margin:'0.2em'}} onClick={onClick}>{children}</button>;
    case 'Input': return <input value={value} onChange={e=>onChange?.(e.target.value)} style={{margin:'0.2em'}}/>;
    case 'Checkbox': return <input type="checkbox" checked={checked} onChange={e=>onChange?.(e.target.checked)}/>;
    case 'Textarea': return <textarea value={value} onChange={e=>onChange?.(e.target.value)}/>;
    case 'Card': return <div style={{border:'1px solid #ccc',padding:'0.5em',margin:'0.5em',borderRadius:'4px'}}>{children}</div>;
    case 'Avatar': return <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#888'}}/>;
    case 'Switch': return <input type="checkbox" checked={checked} onChange={e=>onChange?.(e.target.checked)}/>;
    case 'Label': return <label>{children}</label>;
    default: return <div>{children}</div>;
  }
};
