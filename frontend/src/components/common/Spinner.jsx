export default function Spinner({ size = 'md', center = false }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className={center ? 'flex justify-center items-center p-8' : 'inline-block'}>
      <div className={`${s} border-2 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  );
}
